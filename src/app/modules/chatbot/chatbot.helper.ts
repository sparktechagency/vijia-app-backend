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

export function fixAiGeneratedJson(jsonString: string): string {
  let fixed = jsonString.trim();

  // Step 1: Remove trailing commas (common LLM mistake: , } or , ])
  fixed = fixed.replace(/,\s*}/g, '}');
  fixed = fixed.replace(/,\s*]/g, ']');

  // Step 2: Add missing commas between consecutive objects in arrays
  // Handles patterns like: [ {...} {...} ] → [ {...}, {...} ]
  // Repeated passes to handle nested structures
  let prev: string;
  do {
    prev = fixed;
    fixed = fixed.replace(/(\})\s*(\{)/g, '$1,$2'); // } { → }, {
    fixed = fixed.replace(/(\])\s*(\[)/g, '$1,$2'); // ] [ → ], [
  } while (prev !== fixed);

  // Step 3: Add missing commas between array elements (objects or primitives)
  // Handles cases like {...}{...} inside arrays
  fixed = fixed.replace(/(\[\s*)(\{[^}{]*\})\s*(\{)/g, '$1$2,$3');

  // Step 4: Fix missing commas in object properties: "key":value "nextKey":...
  fixed = fixed.replace(/([^,\]}\s])(?=\s*"[\w-]+"\s*:)/g, '$1,');

  // Step 5: Clean up any double commas just in case
  fixed = fixed.replace(/,,+/g, ',');

  return fixed;
}

export function safeParseAiJson<T = any>(jsonString: string): T | null {
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    try {
      const fixed = fixAiGeneratedJson(jsonString);
      return JSON.parse(fixed);
    } catch (e2) {
      console.error("JSON fix failed:", e2);
      console.log("Attempted fix:", fixAiGeneratedJson(jsonString));
      return null;
    }
  }
}