import { Model, Types } from 'mongoose';

export type IChatbot = {
  user:Types.ObjectId,
  message: string,
  data: any,
  sender: "user"|"ai",
  voice?:string
};

export type ChatbotModel = Model<IChatbot>;
