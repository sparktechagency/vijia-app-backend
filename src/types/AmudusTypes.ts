export interface Hotel {
  chainCode: string
  iataCode: string
  dupeId: number
  name: string
  hotelId: string
  geoCode: {
    latitude: number
    longitude: number
  }
  address: {
    countryCode: string
    postalCode: string
    cityName: string
    lines: string[]
  }
}
export interface HotelsResponse {
  data: Hotel[]
  meta?: {
    count?: number
    links?: {
      self?: string
      next?: string
      previous?: string
    }
  }
}


export interface HotelOrder {
  data: {
    type: 'hotel-order';
    guests: {
      tid: number;
      title: string;
      firstName: string;
      lastName: string;
      phone: string;
      email: string;
    }[];
    travelAgent: {
      contact: {
        email: string;
      };
    };
    roomAssociations: {
      guestReferences: {
        guestReference: string;
      }[];
      hotelOfferId: string;
    }[];
    payment: {
      method: 'CREDIT_CARD' | string;
      paymentCard: {
        paymentCardInfo: {
          vendorCode: string; // e.g., 'VI' for Visa
          cardNumber: string;
          expiryDate: string; // YYYY-MM
          holderName: string;
        };
      };
    };
  };
}


