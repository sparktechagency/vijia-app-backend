import { FlightOffer } from "../../../types/flightOffer";

export type FlightCardData = {
  fromCode: string;
  toCode: string;
  fromCity: string;
  toCity: string;
  duration: string;
  dateTime: string;
  flightNumber: string;
  airlineCode: string;
  price: number;
  offer: FlightOffer;
  currency: string
};


function formatDuration(duration: string) {
  const hours = duration.match(/PT(\d+)H/)?.[1];
  const minutes = duration.match(/H(\d+)M/)?.[1] || duration.match(/PT(\d+)M/)?.[1];
  return `${hours || "0"}h ${minutes || "0"}m`;
}

function formatDateTime(dateString: string) {
  return new Date(dateString).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric"
  });
}

export function mapFlightOfferToCard(flight: FlightOffer): FlightCardData {
  const firstSegment = flight.itineraries[0].segments[0];
  const lastSegment = flight.itineraries[0].segments.slice(-1)[0];

  return {
    fromCode: firstSegment.departure.iataCode,
    toCode: lastSegment.arrival.iataCode,
    fromCity: firstSegment.departure.iataCode || "Unknown",
    toCity: lastSegment.arrival.iataCode || "Unknown",
    duration: formatDuration((flight.itineraries[0] as any)?.duration),
    dateTime: formatDateTime(firstSegment.departure.at),
    flightNumber: firstSegment.carrierCode + firstSegment.number,
    airlineCode: firstSegment.carrierCode,
    price: Number(flight.price.grandTotal),
    currency: flight.price.currency,
    offer: flight
  };
}


export const fastestFlights = (flights: FlightCardData[]) => {
  return flights.sort((a, b) => {
    const durationA = getDurationDifference(a.duration, a.dateTime);
    const durationB = getDurationDifference(b.duration, b.dateTime);
    
    return durationA.hours - durationB.hours || durationA.minutes - durationB.minutes;
  });
}

function getDurationDifference(time1: string, time2: string) {
  const toMinutes = (str: string): number => {
    const hours = parseInt(str.match(/(\d+)h/)?.[1] || '0');
    const minutes = parseInt(str.match(/(\d+)m/)?.[1] || '0');
    return hours * 60 + minutes;
  };

  const diffInMinutes = Math.abs(toMinutes(time1) - toMinutes(time2));
  const diffInHours = diffInMinutes / 60;

  return {
    minutes: diffInMinutes,
    hours: diffInHours,
  };
}

export const closeTimeFlights = (flights: FlightCardData[],startTime: string=new Date().toISOString(), endTime: string=new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString()) => {
  return flights.filter(flight => {
    const time = new Date(`${new Date().getFullYear()} ${flight.dateTime}`);

    console.log(time.toString());
    
  
    
    const startTimeObj = new Date(startTime);
    const endTimeObj = new Date(endTime);
    return time >= startTimeObj && time <= endTimeObj;
  });
}

export const convertTime = (time: string) => {
  let [start, end] = time.split('-');

  // Detect if AM or PM is attached to either part
  const period = end.toUpperCase().includes('PM') ? 'PM' : 'AM';

  // Remove AM/PM from start and end for parsing
  start = start.replace(/AM|PM/i, '').trim();
  end = end.replace(/AM|PM/i, '').trim();

  
  const today = new Date().toISOString().split('T')[0];


  
  // Build full time strings (assume both are same period)
  const startDate = new Date(`${today} ${start}:00 ${period}`);
  const endDate = new Date(`${today} ${end}:00 ${period}`);
  console.log(startDate,endDate);
  
  // Handle the edge case like 6-12PM (12PM is noon, not midnight)
  // and ensure times are in correct order
  if (endDate < startDate) {
    // if end time passes midnight (e.g., 10PM - 2AM)
    endDate.setDate(endDate.getDate() + 1);
  }

  return {
    start: startDate.toISOString(),
    end: endDate.toISOString()
  };
};

export const cheapestFlights = (flights: FlightCardData[],startPrice: number=0, endPrice: number=2000) => {
  return flights.filter(flight => {
    return flight.price >= startPrice && flight.price <= endPrice;
  })?.sort((a, b) => a.price - b.price);
}













/////////// single pricinh offer
type PricingSummary = {
  currency: string;
  baseFareTotal: number;
  taxTotal: number;
  totalAmount: number;
  breakdown: {
    travelerType: string;
    base: number;
    tax: number;
    total: number;
  }[];
  offer:any
};

export function calculatePricing(data: any): PricingSummary {
  const offer = data.data.flightOffers[0];
  const currency = offer.price.currency;

  let baseFareTotal = 0;
  let taxTotal = 0;
  let totalAmount = 0;

  const breakdown = offer.travelerPricings.map((tp: any) => {
    const base = parseFloat(tp.price.base);
    const total = parseFloat(tp.price.total);
    const tax = total - base; // or sum taxes manually

    baseFareTotal += base;
    taxTotal += tax;
    totalAmount += total;

    return {
      travelerType: tp.travelerType,
      base,
      tax,
      total
    };
  });

  return {
    currency,
    baseFareTotal,
    taxTotal,
    totalAmount,
    breakdown,
    offer
  };
}

