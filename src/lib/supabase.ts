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
    };
  };
};
