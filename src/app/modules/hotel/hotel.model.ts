import mongoose, { Schema, Document, Types } from 'mongoose';

interface IGuest {
  name: string;
  phone: string;
  email: string;
}

interface IPayment {
  vendorCode: string;
  cardNumber: string;
  expiryDate: string;
  holderName: string;
}

export interface IBookingRecordDoc extends Document {
  bookingId: string;
  user: Types.ObjectId;
  hotelId: string;
  hotelName: string;
  checkIn: Date;
  checkOut: Date;
  status: string;
  guests: IGuest[];
  totalPrice: string;
  payment: IPayment;
  confirmationNumber: string;
}

const GuestSchema = new Schema<IGuest>({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
});

const PaymentSchema = new Schema<IPayment>({
  vendorCode: { type: String, required: true },
  cardNumber: { type: String, required: true },
  expiryDate: { type: String, required: true },
  holderName: { type: String, required: true },
});

const BookingRecordSchema = new Schema<IBookingRecordDoc>({
  bookingId: { type: String, required: true, unique: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  hotelId: { type: String, required: true },
  hotelName: { type: String, required: true },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
  status: { type: String, required: true },
  guests: { type: [GuestSchema], required: true },
  totalPrice: { type: String, required: true },
  payment: { type: PaymentSchema, required: true },
  confirmationNumber: { type: String, required: true },
});

export const BookingRecord = mongoose.model<IBookingRecordDoc>('BookingRecord', BookingRecordSchema);
