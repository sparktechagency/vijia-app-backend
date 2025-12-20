import { z } from 'zod';

const createUserZodSchema = z.object({
  body: z.object({
    name: z.string({ error: 'Name is required' }),
    email: z.string({ error: 'Email is required' }),
    password: z.string({ error: 'Password is required' }),
    profile: z.string().optional(),
  }),
});

const updateUserZodSchema = z.object({
  name: z.string().optional(),
  contact: z.string().optional(),
  email: z.string().optional(),
  password: z.string().optional(),
  location: z.string().optional(),
  image: z.string().optional(),
});

const accountDeleteZodSchema = z.object({
  body: z.object({
    password: z.string({ error: 'Password is required' }),
  })
})

export const UserValidation = {
  createUserZodSchema,
  updateUserZodSchema,
  accountDeleteZodSchema
};
