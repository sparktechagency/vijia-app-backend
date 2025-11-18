export interface FlightOffersPricing {
  type: string;
  flightOffers: FlightOffer[];
}

export interface FlightOffer {
  id: string;
  source: string;
  itineraries: Itinerary[];
  price: Price;
}

export interface Itinerary {
  duration: string;
  segments: Segment[];
}

export interface Segment {
  departure: LocationInfo;
  arrival: LocationInfo;
  carrierCode: string;
  number: string;
}

export interface LocationInfo {
  iataCode: string;
  at: string;
}

export interface Price {
  currency: string;
  total: string;
}


interface FlightDate {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  price: { total: string };
  links: { flightDestinations: string; flightOffers: string };
}

export interface FlightDatesResponse {
  data: FlightDate[];
  meta?: {
    count?: number;
    links?: {
      self?: string;
      next?: string;
      previous?: string;
    };
  };
}




