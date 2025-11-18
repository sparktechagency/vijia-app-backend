export interface HotelBookingRequest {
  data: BookingData;
}

export interface BookingData {
  offerId: string;
  guests: Guest[];
  payments: Payment[];
  rooms: Room[];
}

export interface Guest {
  id: number;
  name: GuestName;
  contact: GuestContact;
}

export interface GuestName {
  title: string;
  firstName: string;
  lastName: string;
}

export interface GuestContact {
  phone: string;
  email: string;
}

export interface Payment {
  id: number;
  method: string;
  card: CardDetails;
}

export interface CardDetails {
  vendorCode: string;
  cardNumber: string;
  expiryDate: string; // Format: YYYY-MM
}

export interface Room {
  guestIds: number[];
  paymentId: number;
  specialRequest?: string;
}
