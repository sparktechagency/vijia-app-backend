import { amaduesHelper } from "../../../helpers/AmaduesHelper";
import { getRendomPhoto } from "../../../helpers/photoHelper";
import { HotelsResponse } from "../../../types/AmudusTypes";
import { IHomeItem, tags } from "../preference/preference.interface";

export const convertHotelIntoHomeItem = async (hotelData:HotelsResponse['data'])=>{

    const homeItems = hotelData.map(async (hotel ) => {
        const hotelOffers = await amaduesHelper.getHotelsOffers([hotel.hotelId]);
        
        const offer = hotelOffers.data[0]?.offers?.sort((a: any, b: any) => a.price.amount - b.price.amount)?.[0];
       const data ={
        type:"hotel",
        name:hotel.name,
        tags:tags[Math.floor(Math.random() * tags.length)],
        city:hotel.address.cityName,
        country:hotel.address.countryCode,
        images:[await getRendomPhoto(`${hotel.address.cityName}`)],
        description:(hotel as any)?.description || `A luxariast 5-star hotel located in the heart of ${hotel.address.cityName}, offering premium rooms, fine dining, and a rooftop infinity pool.`,
        price:offer?.price?.total || Math.floor(Math.random() * 1000).toFixed(2) as any,
        currency:offer?.price?.currency || "USD",
        isDiscounted: false,
        discountPercentage: 0,
        discountAmount: 0,
        referenceId:hotel.hotelId,
        lat:hotel.geoCode.latitude,
        lng:hotel.geoCode.longitude,
        startDate:new Date().toISOString(),
        endDate:new Date().toISOString(),
    }

    return data
}
)

return await Promise.all(homeItems)
}