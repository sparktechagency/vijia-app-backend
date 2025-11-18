import axios from "axios";
import config from "../config";
import { HotelsResponse } from "../types/AmudusTypes";
import { FlightOffer, FlightResponse } from "../types/flightResponse";
import { FlightDatesResponse, FlightOffersPricing } from "../types/flights";
import { FlightOfferPricingResponse, FlightSearchRequest } from "../types/flightOffer";
import { HotelOrderResponse, Traveler } from "../types/bookFlight";
import { HotelOffersResponse } from "../types/hotelOffer";
import { HotelBookingRequest } from "../types/hotelBooking";
import { ActivitiesResponse, Activity } from "../types/activities";
import { IAmadeusLocationResponse } from "../types/airports";
import { FlightOfferResponse } from "./flightOffer";
import { FlightOrderResponse } from "../types/bookFlghtResponse";
import { IHotelOrder } from "../types/bookHotel";
import { RecommendedLocationsResponse } from "../types/travelTypes";



class Amadues {
    private url = config.amadeus.base_url;
    private apiKey = config.amadeus.api_key;
    private apiSecret = config.amadeus.api_secret;

    async getAccessToken() {
       try {
         const response = await axios.post(`${this.url}/v1/security/oauth2/token`, 
            new URLSearchParams({
                grant_type: 'client_credentials',
                client_id: this.apiKey,
                client_secret: this.apiSecret
            } as any),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );
        return response.data.access_token;
       } catch (error) {
        console.log(error);
        return '';
       }
    }

    async amuduesRequest(url:string,method:"GET"|"POST"|"PUT"|"DELETE",data?:any,params?:any) {
        
        const token =await this.getAccessToken();
        if(params){
            for(const key in params){
                if(params[key] === undefined){
                    delete params[key]
                }
            }
        }
        console.log(params);
        
        return axios({
            method,
            url:`${this.url}${url}`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            params:{
                ...params,
                ...(params?.limit && params?.page ? {page:{offset:params.page,limit:params.limit}}:{})
            },
            ...(method !== 'GET' ? {data}:{})
        
        });
    }

    async getHotelsList (cityCode?:string,radius?:number,ratings?:number):Promise<HotelsResponse> {
        try {
            return (await this.amuduesRequest(`/v1/reference-data/locations/hotels/by-city`,'GET',{},{cityCode,radius,ratings})).data
        } catch (error:any) {
            console.log(error?.response?.data);

            return {
                data:[],
                meta:{}
            }
            
        }
    }
    async getHotelGeoCode(latitude:string,longitude:string):Promise<HotelsResponse> {
        try {
            return (await this.amuduesRequest(`/v1/reference-data/locations/hotels/by-geocode`,'GET',{},{latitude,longitude})).data
        } catch (error) {
            console.log(error);
            return {
                data:[]
            }
        }
    }

  async  getHotelsWithDetails(id:string):Promise<HotelOffersResponse> {
        try {
            console.log(id);
            
            return (await this.amuduesRequest(`/v3/shopping/hotel-offers/${id}`,'GET',{},)).data
        } catch (error:any) {
            console.log(error?.response?.data);
            return {
                data:[]
            }
        }
    }

    async getHotelsOffers(hotelIds:string[]):Promise<HotelOffersResponse> {
        try {
            return (await this.amuduesRequest(`/v3/shopping/hotel-offers`,'GET',{},{hotelIds:hotelIds?.join(','),adults:1},)).data
        } catch (error:any) {
            console.log(error?.response?.data);
            return {
                data:[]
            }
        }
    }

    async getHotelsDetails(hotelIds:string[]):Promise<HotelsResponse> {
        try {
            return (await this.amuduesRequest(`/v1/reference-data/locations/hotels/by-hotels`,'GET',{},{hotelIds:hotelIds?.join(',')},)).data
        } catch (error:any) {
            console.log(error?.response?.data);
            return {
                data:[]
            }
        }
    }
   async getHotelRatings(hotelIds:string[]) {
        try {
            return (await this.amuduesRequest(`/v2/e-reputation/hotel-sentiments`,'GET',{},{hotelIds:hotelIds?.join(',')},)).data
        } catch (error:any) {
            console.log(error);
            return {
                data:[]
            }
        }
    }

    async getTrevelRecomendtionForHotel(originLocationCode:string,destinationLocationCode:string,departureDate:string,returnDate?:string) {
        return (await this.amuduesRequest(`/v1/travel/predictions/trip-purpose`,'GET',{},{originLocationCode,destinationLocationCode,departureDate,returnDate},)).data
    }

    async bookHotelOffer(data:HotelOrderResponse):Promise<IHotelOrder> {
        try {
          return (await this.amuduesRequest(`/v2/booking/hotel-orders`,'POST',data)).data?.data 
        } catch (error:any) {
            console.log(error?.response?.data);
            return {
               
            } as IHotelOrder
        }
    }

    async getFlightsList (originCode:string,destinationCode:string,departureDate:string,returnDate?:string,adults?:number,max?:number):Promise<FlightResponse> {
        try {
            return (await this.amuduesRequest(`/v2/shopping/flight-offers`,'GET',{},{originLocationCode:originCode,destinationLocationCode:destinationCode,departureDate,returnDate:returnDate,adults:adults,max:max},)).data
        } catch (error:any) {
            console.log(error?.response?.data);
            return {
                data:[] as any,
                meta:{}
            }
        }
    }

    async getFlightsListPost (body:FlightSearchRequest):Promise<FlightOfferResponse> {
        console.log(body);
        
        
        try {
            return (await this.amuduesRequest(`/v2/shopping/flight-offers`,'POST',body,)).data
        } catch (error:any) {
            console.log(error?.response?.data);
            return {
                data:[] as any,
                meta:{
                    count:0,
                },
                dictionaries:{
                    aircraft:{},
                    currencies:{},
                    carriers:{},
                    locations:{}
                }
            }
        }
    }

    async getflightsCheapestDateSearch(originCode:string,destinationCode:string,departureDate:string):Promise<FlightDatesResponse> {
        try {
            return (await this.amuduesRequest(`/v1/shopping/flight-dates`,'GET',{},{origin:originCode,destination:destinationCode,departureDate},)).data
        } catch (error) {
            console.log(error);
            return {
                data:[] as any,
                meta:{}
            }
        }
    }

    async getFlightsOfferFromURL(url:string):Promise<FlightResponse> {
        try {
            return (await this.amuduesRequest(url?.replace(this.url!,'')?.replace('nonStop=false&','')?.replace('viewBy=DURATION',''),'GET')).data
        } catch (error:any) {
            console.log(error?.response?.data);
            return {
                data:[] as any,
                meta:{}
            }
        }
    }

    async travelRecomendationForFlight(cityCodes:string,countryCode:string):Promise<RecommendedLocationsResponse> {
        try {
            return (await this.amuduesRequest(`/v1/reference-data/recommended-locations`,'GET',{},{cityCodes,travelerCountryCode:countryCode},)).data
        } catch (error) {
            console.log(error);
            return {
                data:[] as any,
                meta:{
                    count:0,
                    links:{
                        self:''
                    }
                }
            }
        }
    }
    
    async getRealTimePriceOfFlight(offer:FlightOffer):Promise<FlightOfferPricingResponse> {
        try {
            return (await this.amuduesRequest(`/v1/shopping/flight-offers/pricing`,'POST',{
                data:{
                    type:'flight-offers-pricing',
                    flightOffers:[offer]
                }
            })).data
        } catch (error) {
            console.log(error);
            return {
                data:[] as any,
                dictionaries:{locations:{}},
                
            }
        }
    }

    async bookFlight ({offers,travelers}:{offers:FlightOffer[],travelers:Traveler[]}):Promise<FlightOrderResponse> {
        try {
            return (await this.amuduesRequest(`/v1/booking/flight-orders`,'POST',{
                data:{
                    type:'flight-order',
                    flightOffers:offers,
                    travelers:travelers
                }
            })).data
        } catch (error:any) {
            console.log(error?.response?.data);
            return {
                data:[] as any,
                dictionaries:{locations:{}},
                
            }
        }
    }

    async getFlightOrderDetails(orderId:string) {
        try {
            return (await this.amuduesRequest(`/v1/booking/flight-orders/${orderId}`,'GET')).data
        } catch (error) {
            console.log(error);
            return {
                data:[] as any,
                dictionaries:{locations:{}},
                
            }
        }
    }

    async getAactivtiesUsingGeoCode(lat:number,lng:number,radius:number=10):Promise<ActivitiesResponse> {
        console.log(lat,lng,radius);
        
        try {
            return (await this.amuduesRequest(`/v1/shopping/activities`,'GET',{},{latitude:lat,longitude:lng,radius:radius},)).data
        } catch (error:any) {
            console.log(error?.response?.data);
            return {
                data:[] as any,
                meta:{
                    count:0,
                    links:{self:''}
                },
                
            }
        }
    }

    async getAirportBycity(keyword:string):Promise<IAmadeusLocationResponse> {
        try {
            return (await this.amuduesRequest(`/v1/reference-data/locations`,'GET',{},{keyword,subType:'AIRPORT,CITY'},)).data
        } catch (error:any) {
            console.log(error?.response?.data);
            return {
                data:[] as any,
                meta:{
                    count:0,
                    links:{self:''}
                }
            }
        }
    }

    async getSingleActivityById(id:string):Promise<Activity> {
        try {
            return (await this.amuduesRequest(`/v1/shopping/activities/${id}`,'GET')).data?.data
        } catch (error) {
            console.log(error);
            return {
                
            } as any
        }
    }

    async getActiviesUsingCity(countryCode:string,keyword:string,max:number=10,include?:string):Promise<ActivitiesResponse> {
        try {
            return (await this.amuduesRequest(`/v1/reference-data/locations/cities`,'GET',{},{countryCode,keyword,max,include},)).data
        } catch (error:any) {
            console.log(error?.response?.data);
            return {
                data:[],
                meta:{count:0,links:{self:''}}
            }
        }
    }


    async getTranspotOffers(body:Body_TransferOffers){
        try {
            return (await this.amuduesRequest(`/v1/shopping/transport-offers`,'POST',body)).data
        } catch (error:any) {
            console.log(error?.response?.data);
            return {
                data:[] as any,
                meta:{}
            }
        }
    }
}


export const amaduesHelper = new Amadues();