import { Model, Types } from 'mongoose';
import { USER_ROLES } from '../../../enums/user';

export type IUser = {
  name: string;
  role: USER_ROLES;
  contact: string;
  email: string;
  password: string;
  image?: string;
  app_id?: string;
  user_type?: string;
  interested_categories?: string[];
  isSocialLogin?: boolean;
  status: 'active' | 'delete';
  refereralCode?: string;
  refarralLink?: string;
  verified: boolean;
  authentication?: {
    isResetPassword: boolean;
    oneTimeCode: number;
    expireAt: Date;
  };
  location?:{
    type: "Point",
    coordinates: number[]
  },
  intrestedPlaces?:string[],
  searchItems?:string[],
  subscription:Types.ObjectId,
  address?:string,
  date_of_birth?:Date,
  gender?:string,
  bio?:string
};

export type UserModal = {
  isExistUserById(id: string): any;
  isExistUserByEmail(email: string): any;
  isMatchPassword(password: string, hashPassword: string): boolean;
  updateIntrestOfUser(userId: string, places?:string[], searchItems?:string[]): Promise<any>;
} & Model<IUser>;
