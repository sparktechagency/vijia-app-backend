import { StatusCodes } from 'http-status-codes';
import { amaduesHelper } from '../../../helpers/AmaduesHelper';
import { googleHelper } from '../../../helpers/googleMapHelper';
import { FlightBookingRequest, FlightModel, IFlightBookingRecord } from './flight.interface';
import ApiError from '../../../errors/ApiError';
import { IFlighBody } from '../hotel/hotel.interface';
import { JwtPayload } from 'jsonwebtoken';
import { User } from '../user/user.model';
import { calculatePricing, cheapestFlights, closeTimeFlights, convertTime, fastestFlights, mapFlightOfferToCard } from './flight.helpers';
import { RedisHelper } from '../../../tools/redis/redis.helper';
import { FlightOffer } from '../../../types/flightOffer';
import { Traveler } from '../../../types/bookFlight';
import { FlightBookingRecord } from './flight.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { kafkaProducer } from '../../../tools/kafka/kafka-producers/kafka.producer';
import { INotification } from '../notification/notification.interface';


export async function getAitaAddress(address: string) {
  const latlang = await googleHelper.getLatLongFromAddress(address);
      const cityInfo = await googleHelper.getCountryShortAndLongName(
    latlang.lat,
    latlang.lng
  );
  let cityCode: string | undefined;

  const tryAirport = async (name?: string) => {
    if (!name) return;
    const res = await amaduesHelper.getAirportBycity(name);
    return res?.data?.[0]?.iataCode;
  };

  cityCode =
    (await tryAirport(cityInfo?.city?.short_name)) ||
    (await tryAirport(cityInfo?.capital)) ||
    (await tryAirport(cityInfo?.country?.short_name)) ||
    "NYC";

  return cityCode;
}


const getFlightsListUsingGeoCode = async (
  body: IFlighBody,
  user: JwtPayload
) => {
  const cacheKey = `flights:${user.id}`;

  const cache = await RedisHelper.redisGet(cacheKey, body);
  if (cache) {
    console.log("Cache hit");
    return cache;
  }

  const userDetails = await User.findById(user.id).lean();
  if (!userDetails?.location?.coordinates?.length) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User location not found!");
  }

  const latLong = await googleHelper.getLatLongFromAddress(
    body.place[0].origin
  )
  const currency =
    (await googleHelper.getCurrencyFromLatLong(latLong.lat, latLong.lng))?.currencyCode ||
    "USD";

  /* ---------------- Travelers ---------------- */
  const travelers = [
    ...Array.from({ length: body.adults || 1 }).map((_, i) => ({
      id: String(i + 1),
      travelerType: "ADULT",
      fareOptions: ["STANDARD"],
    })),
    ...Array.from({ length: body.children || 0 }).map((_, i) => ({
      id: String((body.adults || 1) + i + 1),
      travelerType: "CHILD",
      fareOptions: ["STANDARD"],
    })),
  ];

  /* ---------------- Origin Destinations ---------------- */

  let originDestinationId = 1;
  const originDestinations = (
    await Promise.all(
      body.place.map(async place => {
        const [originRes, destinationRes] = await Promise.all([
          getAitaAddress(place.origin),
          getAitaAddress(place.destination),
        ]);


        const originCode =
          originRes ||
          place.originAitaCode ||
          "";

        const destinationCode =
          destinationRes ||
          place.destinationAitaCode ||
          "";

        const segments: any[] = [];

        // One way
        segments.push({
          id: String(originDestinationId++),
          originLocationCode: originCode,
          destinationLocationCode: destinationCode,
          departureDateTimeRange: {
            date: new Date(place.departureDate)
              .toISOString()
              .split("T")[0],
          },
        });

        // Return
        if (place.returnDate) {
          segments.push({
            id: String(originDestinationId++),
            originLocationCode: destinationCode,
            destinationLocationCode: originCode,
            departureDateTimeRange: {
              date: new Date(place.returnDate)
                .toISOString()
                .split("T")[0],
            },
          });
        }

        return segments;
      })
    )
  ).flat();

  /* ---------------- Amadeus Search ---------------- */
  const flightsOffer = await amaduesHelper.getFlightsListPost({
    currencyCode: currency,
    originDestinations,
    travelers: travelers as any,
    sources: ["GDS"],
    searchCriteria: {
      maxFlightOffers: body.limit || 10,
      flightFilters: {
        cabinRestrictions: originDestinations.map(od => ({
          cabin: body.class,
          coverage: "ALL_SEGMENTS",
          originDestinationIds: [od.id],
        })),
        carrierRestrictions: {
          excludedCarrierCodes: ["AA", "TP", "AZ"],
        },
      },
    },
  });

  let data =
    flightsOffer?.data?.map(offer =>
      mapFlightOfferToCard(
        offer as any,
        flightsOffer?.dictionaries?.carriers
      )
    ) || [];

  /* ---------------- Filters ---------------- */
  if (body.cheapest || body.minPrice || body.maxPrice) {
    const min = body.cheapest ? 0 : body.minPrice;
    const max = body.cheapest ? 1000 : body.maxPrice;
    data = cheapestFlights(data, min, max);
  }

  if (body.earliest || body.shedule) {
    if (body.earliest) {
      const now = new Date();
      const start = now.getHours() + 1;
      const end = start + 2;
      body.shedule = `${start}-${end}${start >= 12 ? "PM" : "AM"}`;
    }

    const { start, end } = convertTime(body.shedule!);
    data = closeTimeFlights(data, start, end);
  }

  if (body.fastest) {
    data = fastestFlights(data);
  }

  /* ---------------- Cache + Analytics ---------------- */
  await RedisHelper.redisSet(cacheKey, data, body, 60);

  await User.updateIntrestOfUser(
    user.id,
    body.place.map(p => p.origin),
    ["flights"]
  );

  return data;
};

const getSingleFlightOffer = async (offer: any) => {
  const cache = await RedisHelper.redisGet(`flight:${offer?.id}`, offer);
  if (cache) {
    console.log('Cache hit');
    return cache;
  }
  const offers = await amaduesHelper.getRealTimePriceOfFlight(offer);

  const data = calculatePricing(offers);

  await RedisHelper.redisSet(`flight:${offer?.id}`, data, offer, 60);
  return data;
};

const bookFlight = async (data:FlightBookingRequest,user:JwtPayload) => {
    const modfiedUsers = await Promise.all(
        data.userInfos.map(async (user,index):Promise<Traveler> => {
        return {
            id:String(index+1),
            name: {
                firstName:user.firstname,
                lastName:user.lastname,
            },
            contact:{
                emailAddress:user.email,
                phones:[{
                    countryCallingCode:user.phone?.slice(1,3),
                    number:user.phone?.slice(3).trim(),
                    deviceType:'MOBILE'
                }]
            },
            dateOfBirth:new Date(user.dob).toISOString().split('T')[0],
            gender:user.gender?.toUpperCase(),
            documents:[{
                documentType:'PASSPORT',
                birthPlace:user.passport.birthPlace,
                number:user.passport.number,
                issuanceLocation:user.passport.issuanceLocation,
                issuanceDate:new Date(user.passport.issuanceDate).toISOString().split('T')[0],
                expiryDate:new Date(user.passport.expiryDate).toISOString().split('T')[0],
                issuanceCountry:user.passport.issuanceCountry,
                validityCountry:user.passport.validityCountry,
                nationality:user.passport.nationality,
                holder:user.passport.holder
            }]
        }
    })
    )

    
    const bookFlight = await amaduesHelper.bookFlight({
        offers:[data.offerPrice],
        travelers:modfiedUsers
    })

    if(!bookFlight.data) {
      throw new ApiError(StatusCodes.BAD_REQUEST,'Something went wrong')
    }
    const order = bookFlight.data

    const offer = order.flightOffers[0]

    const bookingRecord: IFlightBookingRecord = {
  bookingId: order.id,
  user: user.id,
  pnr: order.associatedRecords[0].reference,
  travelers: order.travelers.map(t => ({
    firstName: t.name.firstName,
    lastName: t.name.lastName,
    gender: t.gender,
    dateOfBirth: t.dateOfBirth
  })),
  flights: offer.itineraries.flatMap(it => 
    it.segments.map(seg => ({
      from: seg.departure.iataCode,
      to: seg.arrival.iataCode,
      departureTime: seg.departure.at,
      arrivalTime: seg.arrival.at,
      airline: seg.carrierCode,
      flightNumber: seg.number
    }))
  ),
  totalPrice: offer.price.grandTotal!,
  currency: offer.price.currency,
  status: "CONFIRMED",
  contact: {
    email: order.travelers[0].contact.emailAddress,
    phone: `${order.travelers?.[0]?.contact?.phones?.[0]?.countryCallingCode}${order?.travelers?.[0]?.contact?.phones?.[0]?.number}`
  }
};

const bookData = await FlightBookingRecord.create(bookingRecord);

await kafkaProducer.sendMessage("create-notification", {
  receiver: [user.id],
  title: "Flight Booked Successfully",
  message:`Your flight from ${offer.itineraries?.[0]?.segments[0]?.departure?.iataCode} to ${offer?.itineraries[0]?.segments.slice(-1)?.[0]?.arrival?.iataCode} has been booked successfully`,
  isRead: false,
  filePath:"hotel-booking",
  referenceId:bookData._id,
} as INotification)

    return {
      invoice_id:bookFlight.data.id,
      payment_date:new Date().toLocaleString(),
      payment_method:"Credit Card",
      payment_status:"Successfull",
      amount:offer.price.grandTotal,
      currency:offer.price.currency
    }
};


const getSingleFlightOrderDetails = async (id:string) => {
    const details = await amaduesHelper.getFlightOrderDetails(id)
    return details
}

const getFlightBookingListFromDB = async (user:JwtPayload,query:Record<string,any>) => {
  const BookingQuery = new QueryBuilder(FlightBookingRecord.find({user:user.id}),query).paginate().sort()
  const [bookings,pagination] = await Promise.all([
    BookingQuery.modelQuery.exec(),
    BookingQuery.getPaginationInfo()
  ])

  return {
    data:bookings,
    pagination
  }
}

export const FlightServices = {
  getFlightsListUsingGeoCode,
  getSingleFlightOffer,
  bookFlight,
  getSingleFlightOrderDetails,
  getFlightBookingListFromDB
};
