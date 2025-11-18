import { z } from 'zod';

const createCategorySchema = z.object({
    body: z.object({
        name: z.string({ required_error: 'Name is required' }),
    })
})

const updateCategorySchema = z.object({
    body: z.object({
        name: z.string().optional(),
    })
})

const createUserTypeSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }),
    icon: z.any({ required_error: 'Icon is required' }),
  }),
})

const updateUserTypeSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    icon: z.any().optional(),
  }),
})

export const CategoryValidations = { createCategorySchema, updateCategorySchema, createUserTypeSchema, updateUserTypeSchema };
