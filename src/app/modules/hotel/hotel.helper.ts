import { IHomeItem } from "../preference/preference.interface";

interface HotelResponse {
  checkInDate: string;
  checkOutDate: string;
  price: {
    currency: string;
    base: string;
    total: string;
  };
  room: {
    typeEstimated: {
      category: string;
      beds: number;
      bedType: string;
    };
    description: {
      text: string;
    };
  };
}

interface FareSummary {
  checkIn: string;
  checkOut: string;
  rackRate: string;
  hotelOffer: string;
  taxesFees: string;
  totalAmount: string;
}

export function convertToFareSummary(response: HotelResponse): FareSummary {
  const basePrice = parseFloat(response.price.base);
  const totalPrice = parseFloat(response.price.total);
  const taxesAndFees = totalPrice - basePrice;
  const hotelOffer = basePrice; // Adjust if you have a discount logic

  return {
    checkIn: new Date(response.checkInDate).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
    checkOut: new Date(response.checkOutDate).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
    rackRate: `${response.price.currency} ${basePrice.toFixed(2)}`,
    hotelOffer: `${response.price.currency} ${hotelOffer.toFixed(2)}`,
    taxesFees: `${response.price.currency} ${taxesAndFees.toFixed(2)}`,
    totalAmount: `${response.price.currency} ${totalPrice.toFixed(2)}`,
  };
}

export const priceFilteringHotel = (data:IHomeItem[],minPrice:number=0,maxPrice:number=1000)=>{
  return data.filter((item: IHomeItem) => {
    const price = item.price;
    return price >= minPrice && price <= maxPrice;
  }).sort((a: IHomeItem, b: IHomeItem) => a.price - b.price);
}
