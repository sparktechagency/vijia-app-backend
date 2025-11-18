import { Schema, model } from 'mongoose';
import { ITransport, TransportModel } from './transport.interface'; 

const transportSchema = new Schema<ITransport, TransportModel>({
  // Define schema fields here
});

export const Transport = model<ITransport, TransportModel>('Transport', transportSchema);
