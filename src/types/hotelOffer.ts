export interface HotelOffersResponse {
  data: HotelOfferData[];
}

export interface HotelOfferData {
  type: string;
  hotel: Hotel;
  available: boolean;
  offers: Offer[];
  self: string;
}

export interface Hotel {
  type: string;
  hotelId: string;
  chainCode: string;
  dupeId: string;
  name: string;
  cityCode: string;
  latitude: number;
  longitude: number;
}

export interface Offer {
  id: string;
  checkInDate: string;
  checkOutDate: string;
  rateCode: string;
  category: string;
  description: Description;
  room: Room;
  guests: Guests;
  price: Price;
  policies: Policies;
  self: string;
  roomInformation: RoomInformation;
}

export interface Description {
  text: string;
  lang: string;
}

export interface Room {
  type: string;
  typeEstimated: TypeEstimated;
  description: Description;
}

export interface TypeEstimated {
  category: string;
  beds: number;
  bedType: string;
}

export interface Guests {
  adults: number;
}

export interface Price {
  currency: string;
  total: string;
  base: string;
  variations: Variations;
}

export interface Variations {
  average: Average;
  changes: Change[];
}

export interface Average {
  base: string;
}

export interface Change {
  startDate: string;
  endDate: string;
  base: string;
}

export interface Policies {
  refundable: {
    cancellationRefund: string;
  };
}

export interface RoomInformation {
  description: string;
  type: string;
  typeEstimated: TypeEstimated;
  name: {
    text: string;
  };
  maxPersonCapacity: {
    total: number;
    adults: number;
    children: number;
  };
}
