export interface FlightOrderResponse {
  data: {
    type: string;
    id: string; // Order ID
    queuingOfficeId?: string;
    associatedRecords: AssociatedRecord[];
    flightOffers: FlightOffer[];
    travelers: Traveler[];
    ticketingAgreement?: {
      option: string;
    };
    automatedProcess?: {
      code: string;
      queue: {
        number: string;
        category: string;
      };
      officeId: string;
    }[];
  };
  dictionaries?: {
    locations?: Record<string, {
      cityCode: string;
      countryCode: string;
    }>;
  };
}

export interface AssociatedRecord {
  reference: string; // PNR
  creationDate: string;
  originSystemCode: string;
  flightOfferId: string;
}

export interface FlightOffer {
  type: string;
  id: string;
  source: string;
  nonHomogeneous?: boolean;
  lastTicketingDate?: string;
  itineraries: Itinerary[];
  price: Price;
  pricingOptions?: {
    fareType: string[];
    includedCheckedBagsOnly?: boolean;
  };
  validatingAirlineCodes: string[];
  travelerPricings: TravelerPricing[];
}

export interface Itinerary {
  segments: Segment[];
}

export interface Segment {
  id: string;
  departure: {
    iataCode: string;
    terminal?: string;
    at: string;
  };
  arrival: {
    iataCode: string;
    at: string;
  };
  carrierCode: string;
  number: string;
  aircraft: {
    code: string;
  };
  duration: string;
  numberOfStops: number;
  co2Emissions?: {
    weight: number;
    weightUnit: string;
    cabin: string;
  }[];
}

export interface Price {
  currency: string;
  total: string;
  base: string;
  fees?: {
    amount: string;
    type: string;
  }[];
  grandTotal?: string;
  billingCurrency?: string;
}

export interface TravelerPricing {
  travelerId: string;
  fareOption: string;
  travelerType: string;
  price: {
    currency: string;
    total: string;
    base: string;
    taxes?: {
      amount: string;
      code: string;
    }[];
    refundableTaxes?: string;
  };
  fareDetailsBySegment: {
    segmentId: string;
    cabin: string;
    fareBasis: string;
    class: string;
    includedCheckedBags?: {
      quantity: number;
    };
  }[];
}

export interface Traveler {
  id: string;
  dateOfBirth: string;
  gender: string;
  name: {
    firstName: string;
    lastName: string;
  };
  documents: {
    number: string;
    issuanceDate: string;
    expiryDate: string;
    issuanceCountry: string;
    issuanceLocation: string;
    nationality: string;
    birthPlace: string;
    documentType: string;
    holder: boolean;
  }[];
  contact: {
    purpose?: string;
    phones?: {
      deviceType: string;
      countryCallingCode: string;
      number: string;
    }[];
    emailAddress: string;
  };
}
