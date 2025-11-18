import { z } from "zod";

const createPackageZodSchema = z.object({
    body: z.object({
        name: z.string({ required_error: 'Name is required' }),
        price: z.number({ required_error: 'Price is required' }),
        perfect_for: z.string({ required_error: 'Perfect for is required' }),
        features: z.array(z.string({ required_error: 'Feature is required' })),
        paymentId: z.string({ required_error: 'Payment ID is required' }),
        referenceId: z.string({ required_error: 'Reference ID is required' }),
        recurring: z.enum(['monthly', 'yearly'], { required_error: 'Recurring is required' }),
    }),
})

const updatePackageZodSchema = z.object({
    body: z.object({
        name: z.string().optional(),
        price: z.number().optional(),
        perfect_for: z.string().optional(),
        features: z.array(z.string()).optional(),
        paymentId: z.string().optional(),
        referenceId: z.string().optional(),
        recurring: z.enum(['monthly', 'yearly']).optional(),
    }),
})

export const PackageValidation = {
    createPackageZodSchema,
    updatePackageZodSchema
}