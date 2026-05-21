export type TransportMode = 'fly' | 'train' | 'bus' | 'drive' | 'ferry';

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
  source?: 'live' | 'estimated';
  updatedAt?: string;
  routePath?: [number, number][];
  fromPlace?: string;
  toPlace?: string;
  travelDate?: string;
  fareNotes?: string[];
  fareBreakdown?: { label: string; value: string }[];
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

export type PageView = 'home' | 'results' | 'explore' | 'blog' | 'about' | InfoPage;
