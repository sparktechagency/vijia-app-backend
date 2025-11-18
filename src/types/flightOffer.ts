export interface FlightOfferPricingResponse {
  data: {
    type: 'flight-offers-pricing';
    flightOffers: FlightOffer[];
    bookingRequirements: BookingRequirements;
  };
  dictionaries: {
    locations: Record<
      string,
      {
        cityCode: string;
        countryCode: string;
      }
    >;
  };
}

export interface FlightOffer {
  type: 'flight-offer';
  id: string;
  source: string;
  instantTicketingRequired: boolean;
  nonHomogeneous: boolean;
  paymentCardRequired: boolean;
  lastTicketingDate: string;
  itineraries: Itinerary[];
  price: FlightPrice;
  pricingOptions: {
    fareType: string[];
    includedCheckedBagsOnly: boolean;
  };
  validatingAirlineCodes: string[];
  travelerPricings: TravelerPricing[];
}

export interface Itinerary {
  segments: Segment[];
}

export interface Segment {
  id: string;
  number: string;
  carrierCode: string;
  aircraft: { code: string };
  operating: { carrierCode: string };
  duration: string;
  numberOfStops: number;
  co2Emissions: {
    weight: number;
    weightUnit: string;
    cabin: string;
  }[];
  departure: {
    iataCode: string;
    terminal?: string;
    at: string;
  };
  arrival: {
    iataCode: string;
    terminal?: string;
    at: string;
  };
}

export interface FlightPrice {
  currency: string;
  total: string;
  base: string;
  grandTotal: string;
  billingCurrency: string;
  fees: {
    amount: string;
    type: string;
  }[];
}

export interface TravelerPricing {
  travelerId: string;
  fareOption: string;
  travelerType: string;
  price: {
    currency: string;
    total: string;
    base: string;
    refundableTaxes: string;
    taxes: {
      amount: string;
      code: string;
    }[];
  };
  fareDetailsBySegment: {
    segmentId: string;
    cabin: string;
    fareBasis: string;
    brandedFare: string;
    class: string;
    includedCheckedBags: {
      quantity: number;
    };
  }[];
}

export interface BookingRequirements {
  emailAddressRequired: boolean;
  mobilePhoneNumberRequired: boolean;
  travelerRequirements: {
    travelerId: string;
    genderRequired: boolean;
    dateOfBirthRequired: boolean;
    redressRequiredIfAny: boolean;
    residenceRequired: boolean;
  }[];
}


export interface FlightSearchRequest {
  currencyCode: string;
  originDestinations: OriginDestination[];
  travelers: Traveler[];
  sources: string[];
  searchCriteria?: SearchCriteria;
}

export interface OriginDestination {
  id: string;
  originLocationCode: string;
  destinationLocationCode: string;
  departureDateTimeRange: {
    date: string;   // e.g. "{{departureDate}}"
    time?: string;  // optional
  };
}

export interface Traveler {
  id: string;
  travelerType: "ADULT" | "CHILD" | "HELD_INFANT" | "SENIOR"; // expand if needed
  fareOptions?: ("STANDARD" | "DISCOUNTED" | "REFUNDABLE")[];
}

export interface SearchCriteria {
  maxFlightOffers?: number;
  flightFilters?: FlightFilters;
}

export interface FlightFilters {
  cabinRestrictions?: CabinRestriction[];
  carrierRestrictions?: CarrierRestrictions;
}

export interface CabinRestriction {
  cabin: "ECONOMY" | "PREMIUM_ECONOMY" | "BUSINESS" | "FIRST";
  coverage: "MOST_SEGMENTS" | "AT_LEAST_ONE_SEGMENT" | "ALL_SEGMENTS";
  originDestinationIds: string[];
}

export interface CarrierRestrictions {
  excludedCarrierCodes?: string[];
  includedCarrierCodes?: string[];
}
