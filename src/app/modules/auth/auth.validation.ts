import { z } from 'zod';

const createVerifyEmailZodSchema = z.object({
  body: z.object({
    email: z.string({ error: 'Email is required' }),
    oneTimeCode: z.number({ error: 'One time code is required' }),
  }),
});

const createLoginZodSchema = z.object({
  body: z.object({
    email: z.string({ error: 'Email is required' }),
    password: z.string({ error: 'Password is required' }),
  }),
});

const createForgetPasswordZodSchema = z.object({
  body: z.object({
    email: z.string({ error: 'Email is required' }),
  }),
});

const createResetPasswordZodSchema = z.object({
  body: z.object({
    newPassword: z.string({ error: 'Password is required' }),
    confirmPassword: z.string({
      error: 'Confirm Password is required',
    }),
  }),
});

const createChangePasswordZodSchema = z.object({
  body: z.object({
    currentPassword: z.string({
      error: 'Current Password is required',
    }),
    newPassword: z.string({ error: 'New Password is required' }),
    confirmPassword: z.string({
      error: 'Confirm Password is required',
    }),
  }),
});

const createSocialSignInZodSchema = z.object({
  body: z.object({
    email: z.string({ error: 'Email is required' }),
  }),
});

export const AuthValidation = {
  createVerifyEmailZodSchema,
  createForgetPasswordZodSchema,
  createLoginZodSchema,
  createResetPasswordZodSchema,
  createChangePasswordZodSchema,
  createSocialSignInZodSchema,
};
