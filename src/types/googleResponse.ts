// types/googlePlaces.ts

export interface GooglePlacesPhoto {
  height: number
  width: number
  photo_reference: string
  html_attributions: string[]
}

export interface GooglePlacesGeometry {
  location: {
    lat: number
    lng: number
  }
  viewport: {
    northeast: { lat: number; lng: number }
    southwest: { lat: number; lng: number }
  }
}

export interface GooglePlacesOpeningHours {
  open_now?: boolean,
  periods?: {
    open: {
      day: number
      time: string
    }
    close: {
      day: number
      time: string
    }
  }[],
  weekday_text?: string[]
}

export interface GooglePlacesPlusCode {
  compound_code: string
  global_code: string
}

export interface GooglePlacesResult {
  business_status?: string
  geometry: GooglePlacesGeometry
  icon?: string,
  formatted_address?: string
  icon_background_color?: string
  icon_mask_base_uri?: string
  name: string
  opening_hours?: GooglePlacesOpeningHours
  photos?: GooglePlacesPhoto[]
  place_id: string
  plus_code?: GooglePlacesPlusCode
  price_level?: number
  rating?: number
  reference?: string
  scope?: string
  types?: string[]
  user_ratings_total?: number
  vicinity?: string
}

export interface GooglePlacesNearbySearchResponse {
  html_attributions?: string[]
  next_page_token?: string
  results: GooglePlacesResult[]
  status: string
}



// Google Place Details Response
export interface GooglePlacePhoto {
  height: number
  width: number
  photo_reference: string
  html_attributions: string[]
}

export interface GooglePlaceResult {
  name: string
  formatted_address: string
  photos?: GooglePlacePhoto[]
  rating?: number
  opening_hours?: GooglePlacesOpeningHours
  vicinity?: string,
  international_phone_number?: string,
  geometry: GooglePlacesGeometry
}

export interface GooglePlaceDetailsResponse {
  html_attributions?: string[]
  result: GooglePlaceResult
  status: string
}

