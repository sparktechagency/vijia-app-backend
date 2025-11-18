import z from "zod";

export const createBookHotelZodSchema = z.object({
  body: z.object({
    offer: z.string({ required_error: 'Offer is required' }),
    guests: z.array(
      z.object({
        fullName: z.string({ required_error: 'Full name is required' }),
        email: z.string({ required_error: 'Email is required' }),
        phone: z.string({ required_error: 'Phone is required' }),
      })
    ).min(1, { message: 'At least one guest is required' }),
    payment: z.object({
      cardNumber: z.string({ required_error: 'Card number is required' }),
      expiryDate: z.string({ required_error: 'Expiry date is required' }),
      vendorCode: z.string({ required_error: 'Vendor code is required' }),
      holderName: z.string({ required_error: 'Holder name is required' }),
    })
  })
})

const getDiscoverPlacesZodSchema = z.object({
  query: z.object({
    type: z.enum(['hotel', 'flight', 'all','restaurant'], { required_error: 'Type is required' }),
    lat: z.string({ required_error: 'Lat is required' }),
    lng: z.string({ required_error: 'Long is required' }),
  }),
});


export const HotelValidation = {
  createBookHotelZodSchema,
  getDiscoverPlacesZodSchema
}