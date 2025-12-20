import axios from "axios";
import { ObjectId } from "mongoose";
import config from "../../../config";
import { Subscription } from "../subscription/subscription.model";
import { User } from "../user/user.model";
import { JwtPayload } from "jsonwebtoken";
import { Package } from "../package/package.model";
import ApiError from "../../../errors/ApiError";
import { StatusCodes } from "http-status-codes";
import QueryBuilder from "../../builder/QueryBuilder";

export interface AppleReceiptResponse {
  status: number;
  environment: "Sandbox" | "Production";
  receipt: {
    receipt_type: string;
    bundle_id: string;
    in_app: AppleInAppTransaction[];
  };
  latest_receipt_info: AppleInAppTransaction[];
  latest_receipt: string;
}

export interface AppleInAppTransaction {
  quantity?: string;
  product_id: string;
  transaction_id: string;
  original_transaction_id: string;
  purchase_date_ms: string;
  expires_date_ms?: string;
  is_trial_period?: "true" | "false";
  is_in_intro_offer_period?: "true" | "false";
  auto_renew_status?: "0" | "1";
}

const APPLE_PRODUCTION_URL = "https://buy.itunes.apple.com/verifyReceipt";
const APPLE_SANDBOX_URL = "https://sandbox.itunes.apple.com/verifyReceipt";

const verifyAppleReceipt = async (receipt: string, userId: ObjectId) => {
  // 🔹 First try production, if fails then sandbox
  let response;
  try {
    response = await axios.post(APPLE_PRODUCTION_URL, {
      "receipt-data": receipt,
      password: config.apple.password,
      "exclude-old-transactions": true,
    });
  } catch {
    response = await axios.post(APPLE_SANDBOX_URL, {
      "receipt-data": receipt,
      password: config.apple.password,
      "exclude-old-transactions": true,
    });
  }

  const data: AppleReceiptResponse = response.data;

  if (data.status !== 0) {
    throw new Error("Invalid Apple receipt");
  }

  // Get latest transaction
  const latest = data.latest_receipt_info?.[0];
  if (!latest) {
    throw new Error("No transactions found in receipt");
  }

  // Convert expiry date
  const expiresMs = latest.expires_date_ms
    ? Number(latest.expires_date_ms)
    : Date.now();

  // 🔹 Expire existing subscription first
  const existing = await Subscription.findOne({
    user: userId,
    status: "active",
  });

  if (existing) {
    existing.status = "expired";
    await existing.save();
  }

  // 🔹 Create new subscription
  const subscription = await Subscription.create({
    name: "Apple Subscription",
    price: 100, // You may map product_id → price dynamically
    startDate: new Date(),
    endDate: new Date(expiresMs),
    txId: latest.transaction_id,
    user: userId,
    status: "active",
  });

  // 🔹 Update user subscription ref
  await User.findByIdAndUpdate(userId, {
    subscription: subscription._id,
  });

  return subscription;
};

const demoSubscriptionForTest = async (packageId:string,user:JwtPayload)=>{

  const packageData = await Package.findById(packageId);
  if(!packageData){
    throw new ApiError(StatusCodes.BAD_REQUEST, "Package doesn't exist!");
  }

  const subscription = await Subscription.create({
    name: packageData.name,
    price: packageData.price,
    startDate: new Date(),
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    txId: "demo",
    user: user.id,
    status: "active",
    package: packageId
  });

  await User.findByIdAndUpdate(user.id, {
    subscription: subscription._id,
  });

  return subscription;
}


const getSubscriptionByUser = async (user: JwtPayload) => {
  const subscription = await Subscription.findOne({ user: user.id,status:"active" }).populate("package");
  if (!subscription) {
    return {
      message: "No active subscription found",
      data: null,
    }
  }
  return {
    message: "Active subscription found",
    data: subscription
  };
};

const subscribedUser = async (query:Record<string,any>) => {
  const SubscriptionQuery = new QueryBuilder(Subscription.find(), query).paginate().sort().search(['name','txId'])

  const [subscriptions,pagination] = await Promise.all([
    SubscriptionQuery.modelQuery.populate("user",'name email image').exec(),
    SubscriptionQuery.getPaginationInfo()
  ])

  return {
    data:subscriptions,
    pagination
  }
}

export const SubscriptionService = {
  verifyAppleReceipt,
  getSubscriptionByUser,
  subscribedUser,
  demoSubscriptionForTest
};
