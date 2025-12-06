import { googleHelper } from '../../../helpers/googleMapHelper';
import { RedisHelper } from '../../../tools/redis/redis.helper';
import { Favorite } from '../favorite/favorite.model';

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
        const isExistFavorite= await Favorite.isExistFavorite(restrudent.place_id)
        return {
            name: restrudent.name,
            address: restrudent.formatted_address,
            rating: restrudent.rating,
            images: images,
            openingHours: restrudent.opening_hours?.open_now ?"Open Now" : "Closed",
            description: restrudent.vicinity||'',
            lat: restrudent.geometry.location.lat,
            lng: restrudent.geometry.location.lng,
            contact: (restrudent as any)?.international_phone_number || 'No Contact',
            referenceId: restrudent.place_id,
            isFavorite:isExistFavorite?true:false,
            hours: restrudent?.opening_hours?.weekday_text||[],
            type:"restrudent",

        }
        
    }))

    const data = {
        restrudents: restrudentWithDistance,
        nextPageToken: restrudent?.next_page_token
    }

    await RedisHelper.redisSet(`restrudent`, data, query, 200);
    return data;

    
};


const getSingleRestrudent = async (placeId: string) => {
    const data = await googleHelper.getPlaceDetailsWithPlaceId(placeId);
    const images = await googleHelper.getMultiplePhoto(data.photos)
    return {
        name: data.name,
        address: data.formatted_address,
        rating: data?.rating,
        images: images,
        openingHours:data?.opening_hours?.open_now ?"Open Now" : "Closed",
        description: data.vicinity||'',
        lat: data.geometry.location.lat,
        lng: data.geometry.location.lng,
        contact: (data as any)?.international_phone_number || 'No Contact',
        referenceId: placeId,
        hours: data?.opening_hours?.weekday_text||[],
        type:"restrudent"
    }

}

export const RestrudentServices = {
    getRestrudentUsingGeoCode,
    getSingleRestrudent
};
