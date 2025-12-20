import { z } from 'zod';
const createActivitySchema = z.object({
    body: z.object({
        title: z.string({ error: 'Title is required' }),
        description: z.string({ error: 'Description is required' }),
        image: z.any(),
        address: z.string({ error: 'Address is required' }),

    })
})
export const ActivityValidations = {
    createActivitySchema
};
