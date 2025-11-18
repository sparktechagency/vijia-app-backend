export interface AddressComponent {
  long_name: string
  short_name: string
  types: string[]
}

export interface GeocodingResult {
  address_components: AddressComponent[]
  formatted_address: string
}

export interface GeocodingResponse {
  results: GeocodingResult[]
  status: string
}
