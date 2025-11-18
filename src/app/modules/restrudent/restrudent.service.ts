import { googleHelper } from '../../../helpers/googleMapHelper';
import { RedisHelper } from '../../../tools/redis/redis.helper';

const getRestrudentUsingGeoCode = async (query: Record<string, any>) => {
    const cache = await RedisHelper.redisGet(`restrudent`, query);
    if (cache) {
        console.log('Cache hit');
        return cache;
    }
    const restrudent = await googleHelper.getRestrudentsUsingTextSearch(`Restaurant in ${query?.city}`,query?.pageToken);
    if(!restrudent) return [];

    const restrudentWithDistance = await Promise.all(restrudent?.results?.map(async (restrudent) => {
        const images = await googleHelper.getMultiplePhoto(restrudent.photos)
        return {
            name: restrudent.name,
            address: restrudent.formatted_address,
            rating: restrudent.rating,
            images: images,
            openingHours: restrudent.opening_hours?.open_now ?"Open Now" : restrudent.opening_hours?.weekday_text,
            discription: restrudent.vicinity,
            lat: restrudent.geometry.location.lat,
            lng: restrudent.geometry.location.lng,
            contact: (restrudent as any)?.international_phone_number || 'No Contact',
            placeId: restrudent.place_id,
        }
        
    }))

    const data = {
        restrudents: restrudentWithDistance,
        nextPageToken: restrudent?.next_page_token
    }

    await RedisHelper.redisSet(`restrudent`, data, query, 200);
    return data;

    
};

export const RestrudentServices = {
    getRestrudentUsingGeoCode
};
