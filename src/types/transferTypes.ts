// Passenger
interface Passenger {
  passengerTypeCode: "ADT" | "CHD" | "INF";
  age: number;
}

// Travel Segment (flight/train)
interface TravelSegmentLocation {
  localDateTime: string;
  iataCode?: string;
  uicCode?: string;
  addressLine?: string;
  zipCode?: string;
  countryCode?: string;
  cityName?: string;
  stateCode?: string;
  geoCode?: string;
  name?: string;
  googlePlaceId?: string;
}

interface TravelSegment {
  transportationType: "FLIGHT" | "TRAIN";
  transportationNumber: string;
  departure: TravelSegmentLocation;
  arrival: TravelSegmentLocation;
}

// StopOver
interface StopOverRequest {
  duration: string;
  locationCode?: string;
  addressLine?: string;
  countryCode?: string;
  cityName?: string;
  zipCode?: string;
  googlePlaceId?: string;
  name?: string;
  stateCode?: string;
  geoCode?: string;
  sequenceNumber: number;
  uicCode?: string;
}

// Main Transfer Offer Body
interface Body_TransferOffers {
  startDateTime: string;
  passengers?: number;
  startLocationCode: string;
  startUicCode?: string;
  startAddressLine?: string;
  startZipCode?: string;
  startCountryCode?: string;
  startCityName?: string;
  startStateCode?: string;
  startGeoCode?: string;
  startName?: string;
  startGooglePlaceId?: string;

  endLocationCode?: string;
  endUicCode?: string;
  endAddressLine?: string;
  endZipCode?: string;
  endCountryCode?: string;
  endCityName?: string;
  endStateCode?: string;
  endGeoCode?: string;
  endName?: string;
  endGooglePlaceId?: string;

  transferType?: "PRIVATE" | "SHARED" | "TAXI" | "HOURLY" | "AIRPORT_EXPRESS" | "AIRPORT_BUS";
  duration?: string;
  language?: string;
  currency?: string;
  vehicleCategory?: "ST" | "BU" | "FC";
  vehicleCode?: "MBK" | "CAR" | "SED" | "WGN" | "ELC" | "VAN" | "SUV" | "LMS" | "TRN" | "BUS";
  providerCodes?: string;
  baggages?: number;
  discountNumbers?: string;
  extraServiceCodes?: string;
  equipmentCodes?: string;
  reference?: string;
  stopOvers?: StopOverRequest[];
  startConnectedSegment?: TravelSegment;
  endConnectedSegment?: TravelSegment;
  passengerCharacteristics?: Passenger[];
}
