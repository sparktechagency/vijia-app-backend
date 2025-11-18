// types.ts

export interface GeoCode {
  latitude: number
  longitude: number
}

export interface RecommendedLocation {
  subtype: 'CITY' | string
  name: string
  iataCode: string
  geoCode: GeoCode
  type: 'recommended-location' | string
  relevance: number
}

export interface MetaLinks {
  self: string
}

export interface Meta {
  count: number
  links: MetaLinks
}

export interface RecommendedLocationsResponse {
  data: RecommendedLocation[]
  meta: Meta
}
