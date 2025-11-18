import { Model, Types } from 'mongoose';

export type IChatbot = {
  user:Types.ObjectId,
  message: string,
  data: any,
  sender: "user"|"ai"
};

export type ChatbotModel = Model<IChatbot>;
