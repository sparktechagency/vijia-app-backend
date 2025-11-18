import { z } from 'zod';
const createActivitySchema = z.object({
    body: z.object({
        title: z.string({ required_error: 'Title is required' }),
        description: z.string({ required_error: 'Description is required' }),
        image: z.any({ required_error: 'Image is required' }),
        address: z.string({ required_error: 'Address is required' }),

    })
})
export const ActivityValidations = {
    createActivitySchema
};
