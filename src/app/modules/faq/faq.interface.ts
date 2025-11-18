import { Model } from 'mongoose';

export type IFaq = {
  question: string;
  answer: string;
  type:"overview"|"flight"|"hotel"
};

export type FaqModel = Model<IFaq>;
