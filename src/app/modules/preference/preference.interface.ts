import { Model, Types } from 'mongoose';
import { HotelsResponse } from '../../../types/AmudusTypes';
import { FlightOfferPricingResponse } from '../../../types/flightOffer';
import { ActivitiesResponse } from '../../../types/activities';

export type IPreference = {
  user: Types.ObjectId;
  city: string;
  country: string;

  hotels: HotelsResponse['data'];
  flights: FlightOfferPricingResponse['data']['flightOffers'];
  activities: ActivitiesResponse['data'];
  aiPreferences: any[];
};

export const tags = ["Almost exhausted",'Best Deals',"Perfect Fit","Budget Friendly"];
export type IHomeItem = {
  user: Types.ObjectId;
  type: "flight" | "hotel" | "activity";
  referenceId: string;
  name: string;
  images: string[];
  description: string;
  price: number;
  isDiscounted: boolean;
  discountPercentage: number;
  discountAmount: number;
  tags:keyof typeof tags,
  bookingLink: string;
  startDate: string;
  endDate: string;
  country: string;
  city: string;
  lat: number;
  lng: number;
  currency: string;
  priceGiving:boolean,
  location:{
    type: "Point",
    coordinates: number[]
  }

}





export type PreferenceModel = Model<IPreference>;
export type HomeItemModel = Model<IHomeItem>;
