import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { SubscriptionService } from "./subscription.service";
import sendResponse from "../../../shared/sendResponse";


const createSubsciption = catchAsync(async (req: Request, res: Response) => {
  const { userId, receipt } = req.body;
  const subscription = await SubscriptionService.verifyAppleReceipt(
    receipt,
    userId
  );
  const response = {
    success: true,
    message: "Subscription created successfully",
    data: subscription,
    statusCode: 200,
  };
sendResponse(res, response);
});

const demoSubscription = catchAsync(async (req: Request, res: Response) => {
  const { userId, receipt } = req.body;
  const subscription = await SubscriptionService.demoSubscriptionForTest(
    receipt,
    {id:userId}
  );
  const response = {
    success: true,
    message: "Subscription created successfully",
    data: subscription,
    statusCode: 200,
  };
sendResponse(res, response);
});

const getSubscription = catchAsync(async (req: Request, res: Response) => {
  const subscription = await SubscriptionService.getSubscriptionByUser(req.user);
  const response = {
    success: true,
    message: "Subscription created successfully",
    data: subscription,
    statusCode: 200,
  };
sendResponse(res, response);
});

const getSubscribers = catchAsync(async (req: Request, res: Response) => {
  const subscription = await SubscriptionService.subscribedUser(req.query);
  const response = {
    success: true,
    message: "Subscription created successfully",
    data: subscription.data,
    pagination: subscription.pagination,
    statusCode: 200,
  };
sendResponse(res, response);
});



export const SubscriptionController = {
  createSubsciption,
  demoSubscription,
  getSubscription,
  getSubscribers
};