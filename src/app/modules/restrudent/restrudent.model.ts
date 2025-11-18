import { Schema, model } from 'mongoose';
import { IRestrudent, RestrudentModel } from './restrudent.interface'; 

const restrudentSchema = new Schema<IRestrudent, RestrudentModel>({
  // Define schema fields here
});

export const Restrudent = model<IRestrudent, RestrudentModel>('Restrudent', restrudentSchema);
