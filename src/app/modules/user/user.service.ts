import { StatusCodes } from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import { USER_ROLES } from '../../../enums/user';
import ApiError from '../../../errors/ApiError';
import { emailHelper } from '../../../helpers/emailHelper';
import { emailTemplate } from '../../../shared/emailTemplate';
import unlinkFile from '../../../shared/unlinkFile';
import generateOTP from '../../../util/generateOTP';
import { IUser } from './user.interface';
import { User } from './user.model';
import { amaduesHelper } from '../../../helpers/AmaduesHelper';
import { googleHelper } from '../../../helpers/googleMapHelper';
import { Subscription } from '../subscription/subscription.model';
import { IPackage } from '../package/package.interface';

const createUserToDB = async (payload: Partial<IUser>): Promise<IUser> => {
  //set role
  payload.role = USER_ROLES.USER;
  const createUser = await User.create(payload);
  if (!createUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create user');
  }

  //send email
  const otp = generateOTP();
  const values = {
    name: createUser.name,
    otp: otp,
    email: createUser.email!,
  };
  const createAccountTemplate = emailTemplate.createAccount(values);
  emailHelper.sendEmail(createAccountTemplate);

  //save to DB
  const authentication = {
    oneTimeCode: otp,
    expireAt: new Date(Date.now() + 3 * 60000),
  };
  await User.findOneAndUpdate(
    { _id: createUser._id },
    { $set: { authentication } }
  );

  return createUser;
};

const getUserProfileFromDB = async (
  user: JwtPayload
): Promise<Partial<IUser>> => {
  const { id } = user;
  let isExistUser = await User.isExistUserById(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  const subscription = await Subscription.findOne({ user: id, status: 'active' }).populate('package')?.lean()

  
  const subscriptionName = subscription?(subscription?.package as any as IPackage)?.name:'Free Plan'


  // const hotelslist = await amaduesHelper.getHotelsList("PAR")
  // const getHotelsOffers = await amaduesHelper.getHotelsOffers([hotelslist.data[0].hotelId])
  // bd lat long

  return {
    ...isExistUser?.toObject(),
    subscription:subscriptionName
  }
};

const updateProfileToDB = async (
  user: JwtPayload,
  payload: Partial<IUser>
): Promise<Partial<IUser | null>> => {
  const { id } = user;
  const isExistUser = await User.isExistUserById(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  //unlink file here
  if (payload.image) {
    unlinkFile(isExistUser.image);
  }

  const updateDoc = await User.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });

  return updateDoc;
};

const deleteAccountFromDB = async (user: JwtPayload,password:string) => {
  const { id } = user;
  const isExistUser = await User.findOne({ _id: id }).select('+password');

  if(isExistUser?.status === 'delete'){
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'You don’t have permission to access this content.It looks like your account has been deactivated.'
    );
  }
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  const isMatch = await User.isMatchPassword(password, isExistUser.password);
  if (!isMatch) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Password is incorrect');
  }

  await User.findOneAndUpdate({ _id: id }, { $set: { status: 'delete' } });
  return isExistUser
};

export const UserService = {
  createUserToDB,
  getUserProfileFromDB,
  updateProfileToDB,
  deleteAccountFromDB
};



