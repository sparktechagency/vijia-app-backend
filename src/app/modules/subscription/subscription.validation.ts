import { z } from "zod";

const createSubsciptionZodSchema = z.object({
  body: z.object({
    receipt: z.string({
      error: 'Receipt is required',
    }),
    userId: z.string({
      error: 'User id is required',
    }),
  }),
});


export const SubscriptionValidation = {
  createSubsciptionZodSchema,
};