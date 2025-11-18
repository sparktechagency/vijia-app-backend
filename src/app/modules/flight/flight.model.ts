import mongoose, { Schema, Document, Types } from "mongoose";

interface ITraveler {
  firstName: string;
  lastName: string;
  gender?: string;
  dateOfBirth?: string;
}

interface IFlightSegment {
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  airline: string;
  flightNumber: string;
}

export interface IFlightBookingRecordDoc extends Document {
  bookingId: string;
  pnr: string;
  user: Types.ObjectId;
  travelers: ITraveler[];
  flights: IFlightSegment[];
  totalPrice: string;
  currency: string;
  status: string;
  contact: {
    email: string;
    phone: string;
  };
}

const TravelerSchema = new Schema<ITraveler>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  gender: String,
  dateOfBirth: String,
});

const FlightSegmentSchema = new Schema<IFlightSegment>({
  from: { type: String, required: true },
  to: { type: String, required: true },
  departureTime: { type: String, required: true },
  arrivalTime: { type: String, required: true },
  airline: { type: String, required: true },
  flightNumber: { type: String, required: true },
});

const FlightBookingRecordSchema = new Schema<IFlightBookingRecordDoc>(
  {
    bookingId: { type: String, required: true, unique: true }, // order.id
    pnr: { type: String, required: true }, // PNR/Reference Code
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    travelers: { type: [TravelerSchema], required: true },
    flights: { type: [FlightSegmentSchema], required: true },
    totalPrice: { type: String, required: true },
    currency: { type: String, required: true },
    status: { type: String, default: "CONFIRMED" },
    contact: {
      email: { type: String, required: true },
      phone: { type: String, required: true },
    },
  },
  { timestamps: true }
);

export const FlightBookingRecord = mongoose.model<IFlightBookingRecordDoc>(
  "FlightBookingRecord",
  FlightBookingRecordSchema
);
