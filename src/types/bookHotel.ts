export interface IHotelOrder {
  type: string;
  id: string;
  hotelBookings: IHotelBooking[];
  guests: IGuest[];
  associatedRecords: IAssociatedRecord[];
  self: string;
}

export interface IHotelBooking {
  type: string;
  id: string;
  bookingStatus: string;
  hotelProviderInformation: IHotelProviderInfo[];
  roomAssociations: IRoomAssociation[];
  hotelOffer: IHotelOffer;
  hotel: IHotel;
  payment: IBookingPayment;
  travelAgentId: string;
}

export interface IHotelProviderInfo {
  hotelProviderCode: string;
  confirmationNumber: string;
}

export interface IRoomAssociation {
  hotelOfferId: string;
  guestReferences: IGuestReference[];
}

export interface IGuestReference {
  guestReference: string;
}

export interface IHotelOffer {
  id: string;
  type: string;
  category: string;
  checkInDate: string;
  checkOutDate: string;
  guests: {
    adults: number;
  };
  policies: IHotelPolicies;
  price: IHotelPrice;
  rateCode: string;
  room: {
    description: {
      lang: string;
      text: string;
    };
    type: string;
  };
  roomQuantity: number;
}

export interface IHotelPolicies {
  additionalDetails: {
    description: { text: string }[];
  }[];
  cancellations: {
    amount: string;
    deadline: string;
    policyType: string;
  }[];
  guarantee: {
    acceptedPayments: {
      creditCardPolicies: { vendorCode: string }[];
      creditCards: string[];
    };
  };
  lengthOfStay: {
    maximumLengthOfStay: number;
    minimumLengthOfStay: number;
  };
  paymentType: string;
  refundable: {
    cancellationRefund: string;
  };
}

export interface IHotelPrice {
  base: string;
  currency: string;
  sellingTotal: string;
  taxes: {
    amount: string;
    code: string;
    currency: string;
    included: boolean;
  }[];
  total: string;
  variations: {
    changes: {
      startDate: string;
      endDate: string;
      base: string;
      currency: string;
    }[];
  };
}

export interface IHotel {
  hotelId: string;
  chainCode: string;
  name: string;
  self: string;
}

export interface IBookingPayment {
  method: string;
  paymentCard: {
    paymentCardInfo: {
      vendorCode: string;
      cardNumber: string;
      expiryDate: string;
      holderName: string;
    };
  };
}

export interface IGuest {
  tid: number;
  id: number;
  title: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
}

export interface IAssociatedRecord {
  reference: string;
  originSystemCode: string;
}
