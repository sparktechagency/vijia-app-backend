import { Schema, model } from 'mongoose';
import { IChatbot, ChatbotModel } from './chatbot.interface'; 

const chatbotSchema = new Schema<IChatbot, ChatbotModel>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  data: {
    type: Object,
  },
  sender: {
    type: String,
    enum: ['user', 'ai'],
    required: true,
  },
});

export const Chatbot = model<IChatbot, ChatbotModel>('Chatbot', chatbotSchema);
