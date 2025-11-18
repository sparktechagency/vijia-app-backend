import { Model, Types } from 'mongoose';

export type IActivity = {
  images : string[],
  title : string,
  user:Types.ObjectId
  description : string,
  address : string,
  location :{
    type : "Point",
    coordinates : number[]
  }
};

export type ActivityModel = Model<IActivity>;
