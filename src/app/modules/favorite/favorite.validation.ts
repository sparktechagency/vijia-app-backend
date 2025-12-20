import { z } from 'zod';
const createFavoriteZodSchema = z.object({
  body: z.object({
    referenceId: z.string({ error: 'Ref ID is required' }),
    type: z.string({ error: 'Type is required' }),
    data: z.any(),
  }),
})
export const FavoriteValidations = {
  createFavoriteZodSchema
};
