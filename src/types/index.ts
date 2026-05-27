export type TransportMode = 'fly' | 'train' | 'bus' | 'drive' | 'ferry';
export type ItineraryLegMode = TransportMode | 'walk' | 'transfer';

export interface ItineraryLeg {
  mode: ItineraryLegMode;
  fromName: string;
  fromArea?: string;
  toName: string;
  toArea?: string;
  duration: string;
  durationMinutes: number;
  operator?: string;
  frequency?: string;
  distance?: string;
  priceFrom?: number;
  priceTo?: number;
}

export interface RouteOption {
  id: string;
  mode: TransportMode;
  title?: string;
  duration: string;
  durationMinutes: number;
  priceFrom: number;
  priceTo: number;
  currency: string;
  stops: number;
  operators: string[];
  distance: string;
  frequency: string;
  highlights: string[];
  legs?: ItineraryLeg[];
  source?: 'live' | 'estimated';
  updatedAt?: string;
  routePath?: [number, number][];
  fromPlace?: string;
  toPlace?: string;
  travelDate?: string;
  fareNotes?: string[];
  fareBreakdown?: { label: string; value: string }[];
  fareProviders?: {
    operator: string;
    title: string;
    link?: string;
    snippet?: string;
    price?: number;
  }[];
  bookingLinks?: {
    label: string;
    provider: string;
    url: string;
  }[];
}

export interface SearchQuery {
  from: string;
  to: string;
  travelDate?: string;
}

export interface PopularRoute {
  id: string;
  from_location: string;
  to_location: string;
  from_country: string;
  to_country: string;
  image_url: string;
  search_count: number;
}

export type SponsoredAdType = 'hotel' | 'travel_agency';

export interface SponsoredAd {
  id: string;
  business_type: SponsoredAdType;
  business_name: string;
  destination: string;
  city: string;
  description: string;
  image_url: string;
  map_url: string;
  contact_phone: string;
  contact_email?: string | null;
  website_url?: string | null;
  price_text?: string | null;
  rating_text?: string | null;
  distance_text?: string | null;
  payment_reference: string;
  payment_amount_inr?: number;
  payment_status?: 'pending' | 'paid' | 'failed' | 'refunded';
  subscription_plan?: 'monthly' | 'yearly';
  subscription_starts_at?: string;
  subscription_expires_at?: string;
  status: 'active' | 'pending' | 'expired';
  created_at: string;
  updated_at: string;
}

export type InfoPage =
  | 'flights'
  | 'trains'
  | 'buses'
  | 'ferries'
  | 'car-rentals'
  | 'careers'
  | 'press'
  | 'faqs'
  | 'contact'
  | 'privacy'
  | 'terms';

export type PageView = 'home' | 'results' | 'explore' | 'blog' | 'about' | 'advertise' | 'payment-success' | 'payment-failed' | InfoPage;
