export interface FlightOrderRequest {
  data: {
    type: 'flight-order';
    flightOffers: any[]; // You can replace `any` with your FlightOfferPricingResponse["data"]["flightOffers"]
    travelers: Traveler[];
    remarks: {
      general: Remark[];
    };
    ticketingAgreement: {
      option: string;
      delay: string;
    };
    contacts: Contact[];
  };
}

export interface Traveler {
  id: string;
  dateOfBirth: string;
  name: {
    firstName: string;
    lastName: string;
  };
  gender: 'MALE' | 'FEMALE' | string;
  contact: {
    emailAddress: string;
    phones: Phone[];
  };
  documents?: Document[];
}

export interface Phone {
  deviceType: 'MOBILE' | 'LANDLINE' | string;
  countryCallingCode: string;
  number: string;
}

export interface Document {
  documentType: string;
  birthPlace?: string;
  issuanceLocation?: string;
  issuanceDate?: string;
  number?: string;
  expiryDate?: string;
  issuanceCountry?: string;
  validityCountry?: string;
  nationality?: string;
  holder?: boolean;
}

export interface Remark {
  subType: string;
  text: string;
}

export interface Contact {
  addresseeName: {
    firstName: string;
    lastName: string;
  };
  companyName: string;
  purpose: string;
  phones: Phone[];
  emailAddress: string;
  address: {
    lines: string[];
    postalCode: string;
    cityName: string;
    countryCode: string;
  };
}





////////////////////////////////////// wat two

export interface HotelOrderResponse {
  data: HotelOrderData;
}

export interface HotelOrderData {
  type: string; // e.g., "hotel-order"
  guests: Guest[];
  travelAgent: TravelAgent;
  roomAssociations: RoomAssociation[];
  payment: Payment;
}

export interface Guest {
  tid: number;
  title: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
}

export interface TravelAgent {
  contact: {
    email: string;
  };
}

export interface RoomAssociation {
  guestReferences: GuestReference[];
  hotelOfferId: string;
}

export interface GuestReference {
  guestReference: string;
}

export interface Payment {
  method: string; // e.g., "CREDIT_CARD"
  paymentCard: {
    paymentCardInfo: PaymentCardInfo;
  };
}

export interface PaymentCardInfo {
  vendorCode: string;
  cardNumber: string;
  expiryDate: string; // Format: YYYY-MM
  holderName: string;
}
