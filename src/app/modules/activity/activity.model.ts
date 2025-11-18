import { Schema, model } from 'mongoose';
import { IActivity, ActivityModel } from './activity.interface'; 

const activitySchema = new Schema<IActivity, ActivityModel>({
  images : [String],
  title : String,
  user:Schema.Types.ObjectId,
  description : String,
  address : String,
  location :{
    type :{
      type : String,
      enum : ['Point'],
      required : false
    },
    coordinates : {
      type : [Number],
      required : false
    }
  },
}, { timestamps: true });
activitySchema.index({ location: '2dsphere' });
export const Activity = model<IActivity, ActivityModel>('Activity', activitySchema);
