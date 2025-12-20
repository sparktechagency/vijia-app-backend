import z from "zod";

export const createBookHotelZodSchema = z.object({
  body: z.object({
    offer: z.string({ error: 'Offer is required' }),
    guests: z.array(
      z.object({
        fullName: z.string({ error: 'Full name is required' }),
        email: z.string({ error: 'Email is required' }),
        phone: z.string({ error: 'Phone is required' }),
      })
    ).min(1, { message: 'At least one guest is required' }),
    payment: z.object({
      cardNumber: z.string({ error: 'Card number is required' }),
      expiryDate: z.string({ error: 'Expiry date is required' }),
      vendorCode: z.string({ error: 'Vendor code is required' }),
      holderName: z.string({ error: 'Holder name is required' }),
    })
  })
})

const getDiscoverPlacesZodSchema = z.object({
  query: z.object({
    type: z.enum(['hotel', 'flight', 'all','restaurant'], { error: 'Type is required' }),
    lat: z.string({ error: 'Lat is required' }),
    lng: z.string({ error: 'Long is required' }),
  }),
});


export const HotelValidation = {
  createBookHotelZodSchema,
  getDiscoverPlacesZodSchema
}