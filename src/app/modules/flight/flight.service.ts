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

const getFlightsListUsingGeoCode = async (
  body: IFlighBody,
  user: JwtPayload
) => {


  const cache = await RedisHelper.redisGet(`flights:${user?.id}`, body);
  if (cache) {
    console.log('Cache hit');
    return cache;
  }
  const userDetails = await User.findOne({ _id: user.id }).lean();
  if (!userDetails) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }
  const [lng, lat] = userDetails?.location?.coordinates || [];
  const currency = await googleHelper.getCurrencyFromLatLong(lat, lng);

  
  const formattedAdults = new Array(body?.adults || 1)
    .fill({})
    .map((_, index) => ({
      id: String(index + 1),
      travelerType: 'ADULT',
      fareOptions: ['STANDARD'],
    }));

  const formattedChildren = new Array(body?.children || 0)
    .fill({})
    .map((_, index) => ({
      id: String(body?.adults + index + 1),
      travelerType: 'CHILD',
      fareOptions: ['STANDARD'],
    }));

  const travelers = [...formattedAdults, ...formattedChildren];

  const promiseData = await Promise.all(
     body.place.map(async (place, index) => {
    const [originCode, destinationCode] = await Promise.all([
      amaduesHelper.getAirportBycity(place.origin),
      amaduesHelper.getAirportBycity(place.destination),
    ]);

    


    

      const originDestinations = [
    {
      id: String(index + 1),
      originLocationCode: originCode?.data?.[index]?.iataCode || body?.place?.[index]?.originAitaCode||'',
      destinationLocationCode: destinationCode?.data?.[index]?.iataCode || body?.place?.[index]?.destinationAitaCode||'',
      departureDateTimeRange: {
        date: new Date(place.departureDate).toISOString().split('T')[0],
        time: new Date(place.departureDate)
          .toISOString()
          .split('T')[1]
          .split('.')[0],
      },
    },
    ...(place?.returnDate
      ? [
          {
            id: String(index + 2),
            originLocationCode: destinationCode?.data?.[index]?.iataCode || body?.place?.[index]?.destinationAitaCode||'',
            destinationLocationCode: originCode?.data?.[index]?.iataCode || body?.place?.[index]?.originAitaCode||'',
            departureDateTimeRange: {
              date: new Date(place.returnDate).toISOString().split('T')[0],
              time: new Date(place.returnDate)
                .toISOString()
                .split('T')[1]
                ?.split('.')[0],
            },
          },
        ]
      : []),
  ];

    return originDestinations
  })
  )



  



  const flightsOffer = await amaduesHelper.getFlightsListPost({
    currencyCode: currency?.currencyCode || 'USD',
    originDestinations: promiseData.flat(),
    travelers: travelers as any,
    sources: ['GDS'],
    searchCriteria: {
      maxFlightOffers: body?.limit || 10,
      flightFilters: {
        cabinRestrictions: [
          {
            cabin: body.class,
            coverage: 'ALL_SEGMENTS',
            originDestinationIds: ['1'],
          },
          //@ts-ignore
          ...(body?.returnDate
            ? [
                {
                  cabin: body.class,
                  coverage: 'ALL_SEGMENTS',
                  originDestinationIds: ['2'],
                },
              ]
            : []),
        ],
        carrierRestrictions: {
          excludedCarrierCodes: ['AA', 'TP', 'AZ'],
        },
      },
    },
  });

  console.log(flightsOffer);
  


  

  let data = flightsOffer?.data?.map(offer =>
     mapFlightOfferToCard(offer as any)
  );

  if(body?.minPrice || body?.maxPrice || body?.cheapest){
    if(body?.cheapest){
      body.minPrice = 0
      body.maxPrice = 1000
    }
    data= cheapestFlights(data,body?.minPrice,body?.maxPrice)
  }

  if(body?.shedule || body?.earliest){
    if(body?.earliest){
      body.shedule = `${new Date().getHours()+1}-${new Date().getHours()>=12 ? new Date().getHours()+3 : new Date().getHours()}${+(new Date().toTimeString().split(' ')[0].split(':')[0]) > 12 ? 'PM' : 'AM'}`
      
    }
    const {start,end} = convertTime(body?.shedule!)
    
    data = closeTimeFlights(data,start,end)
    
  }
  if(body?.fastest){
    data = fastestFlights(data)
  }
  await RedisHelper.redisSet(`flights:${user.id}`, data, body, 3600);
  await User.updateIntrestOfUser(user.id, body.place.map((place: any) => place.origin), ["flights"]);
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

    return bookFlight
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
