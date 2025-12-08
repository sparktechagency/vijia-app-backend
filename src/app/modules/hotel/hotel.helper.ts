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
  currency: string
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
    rackRate: `${basePrice.toFixed(2)}`,
    hotelOffer: `${hotelOffer.toFixed(2)}`,
    taxesFees: `${taxesAndFees.toFixed(2)}`,
    totalAmount: `${totalPrice.toFixed(2)}`,
    currency: response.price.currency
  };
}

export const priceFilteringHotel = (data:IHomeItem[],minPrice:number=0,maxPrice:number=1000)=>{
  return data.filter((item: IHomeItem) => {
    const price = item.price;
    return price >= minPrice && price <= maxPrice;
  }).sort((a: IHomeItem, b: IHomeItem) => a.price - b.price);
}


export function getRoomFacilities(offer: any): string[] {
  const facilities: string[] = [];

  // 1. From roomInformation.description
  const roomInfoDesc = offer.roomInformation?.description;
  if (roomInfoDesc) {
    facilities.push(...roomInfoDesc.split(/[,.;]+/).map((f: string) => f.trim()).filter(Boolean));
  }

  // 2. From room.description.text (fallback)
  const roomDesc = offer.room?.description?.text;
  if (roomDesc) {
    facilities.push(...roomDesc.split(/[,.;]+/).map((f: string) => f.trim()).filter(Boolean));
  }

  // 3. From typeEstimated info
  const est = offer.roomInformation?.typeEstimated || offer.room?.typeEstimated;
  if (est) {
    if (est.category) facilities.push(est.category);
    if (est.beds) facilities.push(`${est.beds} Bed(s)`);
    if (est.bedType) facilities.push(`${est.bedType} Bed`);
  }

  // Remove duplicates
  return [...new Set(facilities)];
}
