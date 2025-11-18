import { Types } from "mongoose";

export interface IPassportInfo {
  number: string;
  expiryDate: string;
  issuanceCountry: string;
  birthPlace?: string;
  issuanceLocation?: string;
  nationality?: string;
}

export interface ITraveler {
  travelerId: string;
  firstname: string;
  lastname: string;
  dob: string;
  gender: string;
  email: string;
  phone: string;
  passport: IPassportInfo;
}

export interface IFlightSegment {
  from: string;
  to: string;
  departure: string;
  arrival: string;
  airline: string;
  flightNumber: string;
  cabin: string;
}

export interface IPriceInfo {
  currency: string;
  total: string;
  base: string;
}

export interface IFlightBooking {
  user: Types.ObjectId;
  orderId: string;
  pnr: string;
  travelers: ITraveler[];
  segments: IFlightSegment[];
  price: IPriceInfo;
}
