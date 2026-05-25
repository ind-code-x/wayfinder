import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export type Database = {
  public: {
    Tables: {
      searches: {
        Row: { id: string; from_location: string; to_location: string; travel_date: string | null; created_at: string };
        Insert: { from_location: string; to_location: string; travel_date?: string | null };
      };
      popular_routes: {
        Row: {
          id: string;
          from_location: string;
          to_location: string;
          from_country: string;
          to_country: string;
          image_url: string;
          search_count: number;
          created_at: string;
          updated_at: string;
        };
      };
      sponsored_ads: {
        Row: {
          id: string;
          business_type: 'hotel' | 'travel_agency';
          business_name: string;
          destination: string;
          city: string;
          description: string;
          image_url: string;
          map_url: string;
          contact_phone: string;
          contact_email: string | null;
          website_url: string | null;
          price_text: string | null;
          rating_text: string | null;
          distance_text: string | null;
          payment_reference: string;
          status: 'active' | 'pending' | 'expired';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          business_type: 'hotel' | 'travel_agency';
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
          status?: 'active' | 'pending' | 'expired';
        };
      };
    };
  };
};
