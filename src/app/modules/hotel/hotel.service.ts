import { JwtPayload } from 'jsonwebtoken';
import { AiHelper } from '../../../helpers/aiHelper';
import { amaduesHelper } from '../../../helpers/AmaduesHelper';
import { googleHelper } from '../../../helpers/googleMapHelper';
import { paginationHelper } from '../../../helpers/paginationHelper';
import { HotelsResponse } from '../../../types/AmudusTypes';
import { FlightOfferPricingResponse } from '../../../types/flightOffer';
import { ActivitiesResponse } from '../../../types/activities';
import { HomeItem, Preference } from '../preference/preference.model';
import { kafkaProducer } from '../../../tools/kafka/kafka-producers/kafka.producer';
import { HomeItemModel, IHomeItem, tags } from '../preference/preference.interface';
import { RedisHelper } from '../../../tools/redis/redis.helper';
import QueryBuilder from '../../builder/QueryBuilder';
import { IBookHotelBody, IDiscoverPlace, IFlighBody } from './hotel.interface';
import { User } from '../user/user.model';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import { convertToFareSummary, getRoomFacilities, priceFilteringHotel } from './hotel.helper';
import { HotelOrderResponse } from '../../../types/bookFlight';
import { BookingRecord } from './hotel.model';
import { INotification } from '../notification/notification.interface';
import { getImagesFromApi, getRendomPhoto } from '../../../helpers/photoHelper';
import { FlightServices } from '../flight/flight.service';
import { FlightCardData } from '../flight/flight.helpers';
import { calculateDistance } from '../../../helpers/locationHelper';
import { Favorite } from '../favorite/favorite.model';

const getHotelsFromApis = async (
  query: Record<string, any>,
  user: JwtPayload
) => {

  const cache = await RedisHelper.redisGet(`preference:${user.id}`, query);
  
  if (cache) {
    console.log('from cache');
    return cache;
  }

  const [lng,lat] = (await User.findOne({ _id: user.id }))?.location?.coordinates ||[]

  const matchLatlong = calculateDistance(lat,lng,Number(query.lat),Number(query.lng)) > 1000
  if((!lng || !lat) ||matchLatlong ){
      await User.findOneAndUpdate(
        { _id: user.id },
        {location: {type: 'Point', coordinates: [query.lng, query.lat]}}
    )
  }
    
  const hotelItems = await HomeItem.findOne({ user: user.id });


  if (!hotelItems?.name || matchLatlong) {
    const cityName = await googleHelper.getCountryShortAndLongName(
      query.lat,
      query.lng
    );

    await kafkaProducer.sendMessage('hotel-in-preference', {
      userId: user.id,
      userAddress: { city: cityName.city, country: cityName.country },
    });
  }

  if (hotelItems?.name) {
    const preferenceQuery = new QueryBuilder(
      HomeItem.find({ user: user.id }),
      query
    )
      .paginate()
      .sort()
      .filter(['lat', 'lng'])
      .search(['name', 'city', 'country', 'description']);
    let [data, pagination] = await Promise.all([
      preferenceQuery.modelQuery.lean(),
      preferenceQuery.getPaginationInfo(),
    ]);



    const response = {
      data: await Promise.all(
        data.map(async (hotel:any) => {
          const isExistFavorite = await Favorite.isExistFavorite(hotel.referenceId,user.id);
          return {
            ...hotel,
            isFavorite: isExistFavorite ? true : false,
          };
        })
      ),
      pagination,
    };

    await RedisHelper.redisSet(`preference:${user.id}`, response, query);
    return response;
  }

  const [ activites] = await Promise.all([
    amaduesHelper.getAactivtiesUsingGeoCode(query.lat, query.lng),
  ]);



  const formatted_activies = activites?.data
    ?.slice(0, 20)
    ?.map(async activity => {
      const address = await googleHelper.getCountryShortAndLongName(
        activity.geoCode.latitude,
        activity.geoCode.longitude
      );
      return {
        type: 'activity',
        referenceId: activity.id,
        name: activity.name,
        images: activity.pictures,
        description: activity.description,
        price: Number(activity.price.amount),
        currency: activity.price.currencyCode,
        isDiscounted: false,
        discountPercentage: 0,
        discountAmount: 0,
        tags: tags[Math.floor(Math.random() * tags.length)],
        bookingLink: '',
        startDate: new Date().toISOString().split('T')[0],
        // 7 days from now
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
        country: address?.country?.long_name,
        city: address?.city?.long_name,
        lat: activity.geoCode.latitude,
        lng: activity.geoCode.longitude,
        isFavorite: false
      };
    });

  const formatted_activites = await Promise.all(formatted_activies);


  const paginateArray = paginationHelper.paginateArray(formatted_activites, query, {
    searchTerm: query.searchTerm,
    fields: ['name', 'city', 'country', 'description'],
  });

  await RedisHelper.redisSet(`preference:${user.id}`, paginateArray, query);
  return paginateArray;
};

const getActiviesForHome = async (
  user: JwtPayload,
  query: Record<string, any>
) => {
  const cache = await RedisHelper.redisGet(`activites:${user.id}`, query);
  if (cache) {
    return cache;
  }
  const activites = await amaduesHelper.getAactivtiesUsingGeoCode(
    query.lat,
    query.lng
  );

  const formatted_activites = await Promise.all(
    activites?.data?.slice(0, 6)?.map(async activity => {
      const address = await googleHelper.getCountryShortAndLongName(
        activity.geoCode.latitude,
        activity.geoCode.longitude
      );
      return {
        type: 'activity',
        referenceId: activity.id,
        name: activity.name,
        images: activity.pictures,
        description: activity.description,
        price: Number(activity.price.amount),
        currency: activity.price.currencyCode,
        isDiscounted: false,
        discountPercentage: 0,
        discountAmount: 0,
        tags: tags[Math.floor(Math.random() * tags.length)],
        bookingLink: activity?.bookingLink,
        startDate: new Date().toISOString().split('T')[0],
        // 7 days from now
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
        country: address?.country?.long_name,
        city: address?.city?.long_name,
        lat: activity.geoCode.latitude,
        lng: activity.geoCode.longitude,
      };
    })
  );

  const paginateArray = paginationHelper.paginateArray(
    formatted_activites,
    query,
    {
      searchTerm: query.searchTerm,
      fields: ['name', 'city', 'country', 'description'],
    }
  );

  await RedisHelper.redisSet(`activites:${user.id}`, paginateArray, query);
  return paginateArray;
};

const singleHomeDetails = async (id: string, query: Record<string, any>,user:JwtPayload) => {
    // const cache = await RedisHelper.redisGet(`home:${id}`, query);
    // if (cache) {
    //   console.log('Cache hit');
    //   return cache;
    // }
  const type = query.type;
  const dbExist = await HomeItem.findOne({ referenceId: id }).lean();

  
  
 if(type=="travel"){
    if(!dbExist){
        throw new ApiError(StatusCodes.NOT_FOUND, 'Place not found');
    }
    await RedisHelper.redisHset(`home:${id}`,query,dbExist);
    const restaurants = await googleHelper.getRestrudentsUsingTextSearch(`Restaurant in ${dbExist?.city}`);
    
    
    

    const distance = await googleHelper.getDistance(
      dbExist?.lat,
      dbExist?.lng,
      query.lat,
      query.lng
    );
    const restrudentsAmount = restaurants?.results?.length;
    const data = {
      ...dbExist,
      distance,
      restrudentsAmount,
    };
    await User.updateIntrestOfUser(user.id, [dbExist?.city], [dbExist?.type]);
    await RedisHelper.redisSet(`home:${id}`, data, query);
    return data
 }

  if (type == 'hotel') {
    const hotel = await amaduesHelper.getHotelsDetails([id]);
    const hotellOffer = await amaduesHelper.getHotelsOffers([id]);

    
    const hotelDetails = hotel?.data?.[0];
    const distance = await googleHelper.getDistance(
      hotelDetails?.geoCode?.latitude,
      hotelDetails?.geoCode?.longitude,
      query.lat,
      query.lng
    );
    const restrudents = await googleHelper.getRestrudentUsingGeoCode(
      hotelDetails?.geoCode?.latitude,
      hotelDetails?.geoCode?.longitude
    );
    const restrudentsAmount = restrudents?.length;
    const cheapestOffer = hotellOffer?.data?.[0]?.offers?.sort((a: any, b: any) => a.price.total - b.price.total);


    
    const currentOffer = cheapestOffer?.[0];
    
    const price = hotellOffer?.data?.[0]?.offers?.[0]?.price?.total;
    const currency = hotellOffer?.data?.[0]?.offers?.[0]?.price?.currency;

    if (dbExist) {
      const data =  {
        ...dbExist,
        currentPrice: price || dbExist.price,
        currency: currency || dbExist.currency,
        status: price ? 'Available' : 'No Rooms Available',
        distance,
        restrudentsAmount,
        offerdetails : currentOffer?.id ? convertToFareSummary(currentOffer) : "No offer available",
        offerId: currentOffer?.id? currentOffer?.id : "No offer available",
        roomFacilities: currentOffer?.id?getRoomFacilities(currentOffer) : "No offer available",
        images: (hotelDetails as any)?.images ||await getImagesFromApi(hotelDetails?.name),
      };
      await RedisHelper.redisSet(`home:${id}`,query,data);
      return data;
    }
    const data = {
      type: 'hotel',
      referenceId: id,
      name: hotelDetails.name,
      images: (hotelDetails as any)?.images ||await getImagesFromApi(hotelDetails?.name),
      description:
        currentOffer?.room?.description?.text ||
        'A luxurious 5-star hotel located in the heart of Dhaka, offering premium rooms, fine dining, and a rooftop infinity pool.',
      price: price || 0,
      currency: currency || '',
      isDiscounted: false,
      discountPercentage: 0,
      discountAmount: 0,
      tags: tags[Math.floor(Math.random() * tags.length)],
      bookingLink: '',
      startDate: new Date().toISOString().split('T')[0],
      // 7 days from now
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      country: hotelDetails.address.countryCode,
      city: hotelDetails.address.cityName,
      lat: hotelDetails.geoCode.latitude,
      lng: hotelDetails.geoCode.longitude,
      status: price ? 'available' : 'Room not available',
      distance,
      restrudentsAmount,
      offerId: currentOffer?.id? currentOffer?.id : "No offer available",
      offerdetails : currentOffer?.id ? convertToFareSummary(currentOffer) : "No offer available",
      roomFacilities: currentOffer?.id?getRoomFacilities(currentOffer) : "No offer available",
    };

    await User.updateIntrestOfUser(user.id, [data?.city], [data?.type]);
    await RedisHelper.redisSet(`home:${id}`,data,query);
    return data;
  }

  if (type == 'activity') {
    const activity = await amaduesHelper.getSingleActivityById(id);
    console.log(activity);

    const distance = await googleHelper.getDistance(
      activity?.geoCode?.latitude,
      activity?.geoCode?.longitude,
      query.lat,
      query.lng
    );

    const restrudents = await googleHelper.getRestrudentUsingGeoCode(
      activity.geoCode.latitude,
      activity.geoCode.longitude
    );

    const restrudentsAmount = restrudents?.length;
    if (dbExist) {
      const data = {
        ...dbExist,
        distance,
        restrudentsAmount,
      };
      await RedisHelper.redisHset(`home:${id}`,query,data);
      return data;
    }
    const address = await googleHelper.getCountryShortAndLongName(
      activity.geoCode.latitude,
      activity.geoCode.longitude
    );
    const data = {
      type: 'activity',
      referenceId: id,
      name: activity.name,
      images: activity.pictures,
      description: activity.description,
      price: Number(activity.price.amount),
      currency: activity.price.currencyCode,
      isDiscounted: false,
      discountPercentage: 0,
      discountAmount: 0,
      tags: tags[Math.floor(Math.random() * tags.length)],
      bookingLink: '',
      startDate: new Date().toISOString().split('T')[0],
      // 7 days from now
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      country: address?.country?.long_name,
      city: address?.city?.long_name,
      lat: activity.geoCode.latitude,
      lng: activity.geoCode.longitude,
      distance,
      restrudentsAmount,
    };
    await User.updateIntrestOfUser(user.id, [data?.city], [data?.type]);
    await RedisHelper.redisSet(`home:${id}`,data,query);
    return data;
  }
};


const getHotelsListFromApis = async (query: Record<string, any>,user:JwtPayload) => {
  const cache = await RedisHelper.redisGet(`hotels`, query);
  if (cache) {
    console.log('Cache hit');
    return cache;
  }
      if(query?.address){
          const latLong = await googleHelper.getLatLongFromAddress(query.address as string);
          if(latLong.lat && latLong.lng){
              query.lat = latLong.lat
              query.lng = latLong.lng
          }
      }
    const cityInfo = await googleHelper.getCountryShortAndLongName(query.lat,query.lng);
 

    console.log(cityInfo);
    
    const airPortInfo = await amaduesHelper.getAirportBycity(cityInfo?.country?.short_name);
    
    let cityName = airPortInfo?.data?.[0]?.iataCode

    if(!cityName){
      const airPortInfo = await amaduesHelper.getAirportBycity(cityInfo?.city?.short_name);
      cityName = airPortInfo?.data?.[0]?.iataCode
      if(!cityName){
        const airPortInfo = await amaduesHelper.getAirportBycity(cityInfo?.capital);
        cityName = airPortInfo?.data?.[0]?.iataCode
      }
      else{
        cityName = 'NYC'
      }
    }

    

    const getHotelsList = await amaduesHelper.getHotelsList(cityName,query?.radius || 100,query?.rating || 4);

    await User.updateIntrestOfUser(user.id, [getHotelsList?.data?.[0]?.address?.cityName], ['hotel']);
    
    const paginatieArray = paginationHelper.paginateArray(getHotelsList?.data, query);

    const datak = (paginatieArray.data) as any as typeof getHotelsList["data"]
    let mapData = await Promise.all(datak.map(async (hotel) => {
      const offer = await amaduesHelper.getHotelsOffers([hotel.hotelId]);
      const cheapestOffer = offer?.data?.[0]?.offers?.sort((a: any, b: any) => a?.price?.total - b?.price?.total)[0];
      const price = cheapestOffer?.price?.total;
      const currency = cheapestOffer?.price?.currency;
      const checkIn = new Date(cheapestOffer?.checkInDate || Date.now()).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
      const checkOut = new Date(cheapestOffer?.checkOutDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) ).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
      const isFavorite = await Favorite.isExistFavorite(hotel.hotelId,user.id);
      const data = {
        type: 'hotel',
        referenceId: hotel.hotelId,
        name: hotel.name,
        images: (hotel as any)?.pictures|| getImagesFromApi(`${hotel.name}`) || ['https://files.sitebuilder.name.tools/3e/c9/3ec93012-63c2-4211-9dc7-3ee806d09db6.jpeg'],
        description: (hotel as any)?.description || `A luxurious 5-star hotel located in the heart of ${hotel.address.cityName}, offering premium rooms, fine dining, and a rooftop infinity pool.`,
        price:price || String(((Math.random() * 1000).toFixed(2))),
        currency:currency || "USD",
        isDiscounted: false,
        discountPercentage: 0,
        discountAmount: 0,
        tags: tags[Math.floor(Math.random() * tags.length)],
        bookingLink: '',
        startDate: checkIn || new Date().toISOString().split('T')[0],
        // 7 days from now
        endDate: checkOut || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        country: hotel.address.countryCode,
        city: hotel.address.cityName,
        lat: hotel.geoCode.latitude,
        lng: hotel.geoCode.longitude,
        rating: (hotel as any)?.rating || 0,
        isFavorite:isFavorite? true : false,
        offer_id:cheapestOffer?.id||''
      }
      return data
    }))

    if(query?.minPrice || query?.maxPrice|| query?.cheapest){
      mapData = priceFilteringHotel(mapData as any,query.minPrice,query.maxPrice) as any
    }
    
  const data = {
    data: mapData,
    pagination: paginatieArray.pagination
  }

  if(query.address){
    delete query.lat
    delete query.lng
  }

  await RedisHelper.redisSet(`hotels`,data,query,60);
  return data
}

const bookHotelIntoApis = async (data:IBookHotelBody,user:JwtPayload)=>{
  const geustList:HotelOrderResponse["data"]["guests"] = data.guests.map((guest,index)=>{
    const response:HotelOrderResponse["data"]["guests"][0] = {
      firstName:guest.fullName.split(" ")[0],
      lastName:guest.fullName.split(" ")[1],
      email:guest.email,
      phone:guest.phone,
      tid:index+1,
      title:"MR"
    }
    return response
  })
  const bookHotel = await amaduesHelper.bookHotelOffer({
    data:{
      type:"hotel-order",
      guests:geustList,
      travelAgent:{
        contact:{
          email:user.email
        }
      },
      roomAssociations:[
        {
          guestReferences:geustList.map((guest,index)=>{
            return {
              guestReference:`${index+1}`
            }
          }),
          hotelOfferId:data.offer
        }
      ],
      payment:{
        method:"CREDIT_CARD",
        paymentCard:{
          paymentCardInfo:{
            cardNumber:data.payment.cardNumber,
            expiryDate:data.payment.expiryDate,
            vendorCode:data.payment.vendorCode,
            holderName:data.payment.holderName
          }
        }
      }
    }
  })

  if(!bookHotel){
    throw new ApiError(400,"Something went wrong")
  }

  const hotelBooking = bookHotel?.hotelBookings?.[0]
  const guests = bookHotel?.guests


  const bookingRecord = {
  bookingId: hotelBooking.id,
  hotelId: hotelBooking.hotel.hotelId,
  user: user.id,
  hotelName: hotelBooking.hotel.name,
  checkIn: hotelBooking.hotelOffer.checkInDate,
  checkOut: hotelBooking.hotelOffer.checkOutDate,
  status: hotelBooking.bookingStatus,
  guests: guests.map(g => ({
    name: `${g.firstName} ${g.lastName}`,
    phone: g.phone,
    email: g.email
  })),
  totalPrice: hotelBooking.hotelOffer.price.total,
  payment: hotelBooking.payment.paymentCard.paymentCardInfo,
  confirmationNumber: hotelBooking.hotelProviderInformation[0].confirmationNumber
};

const datak  =await BookingRecord.create(bookingRecord);

await kafkaProducer.sendMessage('create-notification', {
  receiver: [user.id],
  title: 'Hotel Booked Successfully',
  message:`You have successfully booked the hotel ${hotelBooking.hotel.name} from ${hotelBooking.hotelOffer.checkInDate} to ${hotelBooking.hotelOffer.checkOutDate}`,
  isRead: false,
  filePath:"hotel-booking",
  referenceId:datak._id,
} as INotification)

  return bookHotel

}


const getHotelBookingList = async (user:JwtPayload,query:Record<string,any>)=>{

  const cache = await RedisHelper.redisGet(`hotels_bookings:${user.id}`,query);

  if(cache){
    console.log('from cache');
    return cache
  }
  const bookingQuery = new QueryBuilder(BookingRecord.find({user:user.id}),query).paginate().sort()

  const [bookings,pagination] = await Promise.all([
    bookingQuery.modelQuery.exec(),
    bookingQuery.getPaginationInfo()
  ])

  const data = {
    data:bookings,
    pagination
  }

  await RedisHelper.redisSet(`hotels_bookings:${user.id}`,data,query,60);
  return data
}


const discoverPlaces = async (query:Record<string,any>,user:JwtPayload)=>{
  const cache = await RedisHelper.redisGet(`discover:${user.id}`,query);
  if(cache){
    console.log('from cache');
    return cache
  }
  const UserDetails = await User.findById(user.id)
  if(!UserDetails){
    throw new ApiError(400,"User not found")
  }
  
  const [lng,lat] = [query.lng,query.lat]

  const addressDetails = await googleHelper.getCountryShortAndLongName(lat,lng)
  const airportDetails = await amaduesHelper.getAirportBycity(addressDetails.city?.long_name)
  const airportId = airportDetails?.data?.[0]
  const travelAdvice = await amaduesHelper.travelRecomendationForFlight(airportId?.iataCode,addressDetails.country?.short_name)

  const getHotels =async ()=>{
    const hotels = (await amaduesHelper.getHotelGeoCode(lat+"",lng+"")).data
    const mapData = hotels.map(async (hotel)=>{
      const offer = (await amaduesHelper.getHotelsOffers([hotel.hotelId])).data
      const data = {
        title:hotel.name,
        type:"hotel",
        tags:tags[Math.floor(Math.random() * tags.length)],
        images:(hotel as any).pictures || await getImagesFromApi(`${hotel.address.cityName}`),
        referenceId:hotel.hotelId,
        lat:hotel.geoCode.latitude,
        lng:hotel.geoCode.longitude,
        price:offer?.[0]?.offers?.[0]?.price?.total as any || Math.floor(Math.random() * 1000),
        currency:offer?.[0]?.offers?.[0]?.price?.currency as any || "USD",
        extraIds:[offer?.[0]?.offers?.[0]?.id],
        address:`${hotel.address.cityName},${hotel.address.countryCode}`
      }
      return data
    })
    return await Promise.all(mapData)
  }

  const getRestrudents = async ()=>{
    
    const restrudents = await googleHelper.getRestrudentUsingGeoCode(lat,lng)
    const mapData = restrudents.map(async (restrudent)=>{

      const data = {
        title:restrudent.name,
        type:"restaurant",
        tags:tags[Math.floor(Math.random() * tags.length)],
        images:restrudent.photos?.[0]?.photo_reference ?await googleHelper.getMultiplePhoto([restrudent.photos?.[0]]): await getImagesFromApi(`${restrudent.formatted_address}`),
        referenceId:restrudent.place_id,
        lat:restrudent.geometry.location.lat,
        lng:restrudent.geometry.location.lng,
        address:restrudent.formatted_address!
        
      }
      return data
    })
    return await Promise.all(mapData)
  }

  const getFlights = async ()=>{
    const flights:FlightCardData[] = await FlightServices.getFlightsListUsingGeoCode({
      place: [{
         origin: airportId?.iataCode,
         destination:travelAdvice?.data?.[0]?.iataCode,
         departureDate: new Date(new Date().getTime() + 2* 24 * 60 * 60 * 1000).toISOString(),
         returnDate: new Date(new Date().getTime() + 3* 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    limit:5,
    adults:1,
    class:"BUSINESS",
    children:0,

    },user)

    const mapData = flights.map(async (flight)=>{
      const data = {
        title:`${flight.fromCity} to ${flight.toCity}`,
        type:"flight",
        tags:tags[Math.floor(Math.random() * tags.length)],
        images:["https://wallpapercave.com/wp/wp4128800.jpg"],
        referenceId:flight.flightNumber,
        price:flight.price,
        currency:flight.currency,
        extraIds:[flight.flightNumber],
        offer:flight.offer,
      }
      return data
    })
    return await Promise.all(mapData)
    
  }

  switch (query.type) {
    case "hotel":
      const hotels = paginationHelper.paginateArray(await getHotels(),query)
      await RedisHelper.redisSet(`discover:${user.id}`,hotels,query,260)
      return hotels
    case "restaurant":
      const restaurants = paginationHelper.paginateArray(await getRestrudents(),query)
      await RedisHelper.redisSet(`discover:${user.id}`,restaurants,query,260)
      return restaurants

    case "flight":
      const flights = paginationHelper.paginateArray(await getFlights(),query)
      await RedisHelper.redisSet(`discover:${user.id}`,flights,query,260)
      return flights

    case 'all':
      const arr = (await Promise.all([getHotels(),getRestrudents(),getFlights()])).flat()
      // suffle the array
      const result = paginationHelper.paginateArray(arr.sort(() => Math.random() - 0.5),query)
      await RedisHelper.redisSet(`discover:${user.id}`,result,query,260)
      return result
    default:
      return paginationHelper.paginateArray([],query)
  }

}


export const HotelService = {
  getHotelsFromApis,
  getActiviesForHome,
  singleHomeDetails,
  getHotelsListFromApis,
  bookHotelIntoApis,
  getHotelBookingList,
  discoverPlaces
};
