import config from '../config';
import { GeocodingResponse } from '../types/countryTypes';
import {
  GooglePlaceDetailsResponse,
  GooglePlacesNearbySearchResponse,
} from '../types/googleResponse';

  type AddressComponent = {
      long_name: string;
      short_name: string;
      types: string[];
    }
class GoogleHelper {
  private apiKey = config.google.api_key;

  async getRestrudentUsingGeoCode(
    lat: number,
    lng: number,
    radius: number = 10,
    pageToken?: string
  ): Promise<GooglePlacesNearbySearchResponse['results']> {
 
    
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=restaurant&key=${
        this.apiKey
      }${pageToken ? `&pagetoken=${pageToken}` : ''}`
    );
    const data = await response.json();
    
    return data.results;
  }

  async getPlaceDetailsWithPlaceId(
    placeId: string
  ): Promise<GooglePlaceDetailsResponse> {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,international_phone_number,website,rating,photo&key=${this.apiKey}`
    );
    const data = await response.json();
    return data.result;
  }

  async getPhoto(photoReference: string): Promise<string> {
    // const response = await fetch(
    return  `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${this.apiKey}`
    // );
    // const data = await response.blob();
    // return URL.createObjectURL(data);
  }

  async getMultiplePhoto(
    photoResponse: GooglePlaceDetailsResponse['result']['photos']
  ): Promise<string[]> {
    const promises =
      photoResponse?.map(async photo => {
        const photoUrl = await this.getPhoto(photo.photo_reference);
        return photoUrl;
      }) || [];
    return await Promise.all(promises);
  }

  async getCountryDetailsUsingGeoCode(
    lat: number,
    lng: number
  ): Promise<AddressComponent> {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${this.apiKey}`
      );
      const data = await response.json();
      
      return data.results[0]?.address_components
    } catch (error) {
      return {
        long_name: '',
        short_name: '',
        types: []
      }
    }
  }
  

  async getCountryShortAndLongName(lat: number, lng: number): Promise<{
    country:{
      short_name: string;
      long_name: string;
    },
    city: {
      short_name: string;
      long_name: string;
    },
    capital: string
  }> {
   try {
     const response:any = await this.getCountryDetailsUsingGeoCode(lat, lng);

    
    const components = response
    const country = components.find((c:AddressComponent) => c.types.includes('country'));
    const city = components.find((c:AddressComponent) => c.types.includes('locality'));
const restRes = await fetch(`https://restcountries.com/v3.1/alpha/${country?.short_name}`);
    const restData = await restRes.json();
    const capital = restData?.[0]?.capital?.[0];
    return {
      country: {
        short_name: country?.short_name || '',
        long_name: country?.long_name || ''
      },
      city: {
        short_name: city?.short_name || '',
        long_name: city?.long_name || ''
      },
      capital: capital
    }

   } catch (error) {
    console.log(error);

    return {
      country: {
        short_name: '',
        long_name: ''
      },
      city: {
        short_name: '',
        long_name: ''
      },
      capital: ''
    }
    
   }
  }

  async getCountryAndCityDetailsUsingGeoCode(
    lat: number,
    lng: number
  ){
    try {
          const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${this.apiKey}`
    );
    const data = await response.json();
    //typeof data
  
    return data?.results[0].address_components
    } catch (error) {
      return
    }
  }

 async getLatLongFromCityAndCountry(city: string, country: string) {
     const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${city},${country}&key=${this.apiKey}`
    );
    const data = await res.json();
    // send lat long like {lat: 48.8566, lng: 2.3522}

    if(data.status === 'ZERO_RESULTS'){
      return {
        lat: 48.8566,
        lng: 2.3522
      }
    }
    
    return {
      lat: data.results[0].geometry?.location?.lat,
      lng: data.results[0].geometry?.location?.lng
    }
  }

  async getRestrudentsUsingTextSearch(text: string,nextPageToken?: string): Promise<GooglePlacesNearbySearchResponse> {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${text}&key=${this.apiKey}${nextPageToken ? `&pagetoken=${nextPageToken}` : ''}`
    );
    const data = await response.json();
    return data;
  }

  async getDistance(lat1: number, lng1: number, lat2: number, lng2: number): Promise<{km: number}> {
try {
  console.log(lat1,lng2,lat2,lat1);
  
      const response = await fetch(
      `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${lat1},${lng1}&destinations=${lat2},${lng2}&key=${this.apiKey}`
    );
    const data = await response.json();
    console.log(data?.rows?.[0].elements?.[0]);
    
    return {
      km: data.rows?.[0].elements?.[0].distance.value
    }
} catch (error) {
  return {
    km: 0
  }
}
  }

  // get currency by lat and lng
  async getCurrencyFromLatLong(lat: number, lon: number): Promise<any> {
  try {
    // Step 1: Reverse Geocode to get Country Code
    const geoRes = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${this.apiKey}`
    );
    const geoData = await geoRes.json();

    const countryComponent = geoData.results
      ?.flatMap((r: any) => r.address_components)
      ?.find((c: any) => c.types.includes("country"));

    if (!countryComponent) {
      throw new Error("Could not determine country from coordinates");
    }

    const country = countryComponent.long_name;
    const countryCode = countryComponent.short_name; // Example: "IN"

    // Step 2: Get Currency from REST Countries
    const restRes = await fetch(`https://restcountries.com/v3.1/alpha/${countryCode}`);
    const restData = await restRes.json();

    const currencies = restData[0].currencies;
    const currencyCode = Object.keys(currencies)[0];
    const currencyInfo = currencies[currencyCode];

    return {
      country,
      countryCode,
      currencyCode,
      currencyName: currencyInfo.name,
      currencySymbol: currencyInfo.symbol,
    };
  } catch (err) {
    console.error("Error fetching currency:", err);
    return null;
  }
}

async getLatLongFromAddress(address: string) {
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${this.apiKey}`
  );
  const data = await response.json();
  return {
    lat: data.results?.[0]?.geometry?.location?.lat,
    lng: data.results?.[0]?.geometry?.location?.lng
  }
}
}




export const googleHelper = new GoogleHelper();
