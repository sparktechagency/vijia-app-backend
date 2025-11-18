import { Schema, model } from 'mongoose';
import { IFaq, FaqModel } from './faq.interface'; 

const faqSchema = new Schema<IFaq, FaqModel>({
  question: {
    type: String,
    required: true
  },
  answer: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['overview', 'flight', 'hotel'],
    required: true
  }
});

export const Faq = model<IFaq, FaqModel>('Faq', faqSchema);
