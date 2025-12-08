import { CabinRestriction } from '../../../types/flightOffer';

export type IFlighBody = {
  place: 
    {
      origin: string;
      destination: string;
      departureDate: string;
      returnDate?: string;
      originAitaCode?: string;
      destinationAitaCode?: string
    }[]
  
  adults: number;
  children: number;
  class: CabinRestriction['cabin'];
  limit?: number;
  minPrice?: number,
  maxPrice?: number,
  shedule?: string,
  cheapest?: boolean,
  fastest?: boolean,
  earliest?: boolean
};


export type IDiscoverPlace = {
  type:"hotel"|"restaurant"| "flight";
  tag: string;
  image: string;
  title: string;
  price?: number;
  currency?: string;
  referenceId: string;
  extraIds?: string[],
  offer?:any,
  lat: number;
  lng: number,
  address:string
}


export type IBookHotelBody = {
  offer: string,
  guests:{
    fullName : string,
    email : string,
    phone : string,
  }[],
  payment : {
    cardNumber : string,
    expiryDate : string,
    vendorCode : string,
    holderName : string
  }
} 


export interface IBookingRecord {
  bookingId: string;
  hotelId: string;
  hotelName: string;
  checkIn: string; // ISO date string
  checkOut: string; // ISO date string
  status: string;
  guests: {
    name: string;
    phone: string;
    email: string;
  }[];
  totalPrice: string; // can also be number if you want
  payment: {
    vendorCode: string;
    cardNumber: string;
    expiryDate: string;
    holderName: string;
  };
  confirmationNumber: string;
}

export interface FareSummary {
  checkIn: string;
  checkOut: string;
  rackRate: number;
  offerRate: number;
  discountText: string;
  taxesAndFees: number;
  totalAmount: number;
}