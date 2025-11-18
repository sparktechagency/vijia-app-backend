import { Model, Types } from 'mongoose';
import { FlightOffer } from '../../../types/flightOffer';

export type IFlight = {
  fromCode: string;
  toCode: string;
  fromCity: string;
  toCity: string;
  duration: string;
  dateTime: string;
  flightNumber: string;
  airlineCode: string;
  price: string;
  offer: FlightOffer;
};

export type IUserInfo = {
    firstname: string;
  lastname: string;
  email: string;
  phone: string;
  dob: string;
  nationality: string;
  gender: string;
  recentFlayerNumber: string;

  passport: {
    birthPlace: string;
    issuanceLocation: string;
    issuanceDate: string;
    number: string;
    expiryDate: string;
    issuanceCountry: string;
    validityCountry: string;
    nationality: string;
      holder: boolean;
  };
}

export type FlightBookingRequest = {
  userInfos:IUserInfo[],
  offerPrice:any
};

export type FlightModel = Model<IFlight>;


export interface IFlightBookingRecord {
  bookingId: string;
  pnr: string;
  user:Types.ObjectId
  travelers: ITraveler[];
  flights: IFlightSegment[];
  totalPrice: string;
  currency: string;
  status: string; // CONFIRMED, CANCELLED etc.
  contact: {
    email: string;
    phone: string;
  };
}

export interface ITraveler {
  firstName: string;
  lastName: string;
  gender?: string;
  dateOfBirth?: string;
}

export interface IFlightSegment {
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  airline: string;
  flightNumber: string;
}

