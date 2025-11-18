export interface IGeoCode {
  latitude: number;
  longitude: number;
}

export interface IAddress {
  cityName: string;
  cityCode: string;
  countryName: string;
  countryCode: string;
  stateCode?: string;
  regionCode?: string;
}

export interface IAnalyticsTravelers {
  score: number;
}

export interface IAnalytics {
  travelers: IAnalyticsTravelers;
}

export interface ILocationItem {
  type: "location";
  subType: "AIRPORT" | "CITY";
  name: string;
  detailedName: string;
  id: string;
  self: {
    href: string;
    methods: ("GET" | "POST" | "PUT" | "DELETE")[];
  };
  timeZoneOffset: string;
  iataCode: string;
  geoCode: IGeoCode;
  address: IAddress;
  analytics?: IAnalytics;
}

export interface IAmadeusLocationResponse {
  meta: {
    count: number;
    links: {
      self: string;
    };
  };
  data: ILocationItem[];
}
