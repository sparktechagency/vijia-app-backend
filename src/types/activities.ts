export interface ActivitiesResponse {
  data: Activity[];
  meta: {
    count: number;
    links: {
      self: string;
    };
  };
}

export interface Activity {
  type: "activity";
  id: string;
  self: {
    href: string;
    methods: string[];
  };
  name: string;
  description: string;
  geoCode: {
    latitude: number;
    longitude: number;
  };
  price: {
    amount: string; // Keep as string because Amadeus returns strings, even for decimals
    currencyCode: string;
  };
  pictures: string[];
  bookingLink: string;
  minimumDuration: string;
}
