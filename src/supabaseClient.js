import { createClient } from "@supabase/supabase-js";

// Get environment variables (works with Vite, create-react-app, Node, etc.)
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL 
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY 

// Fallback (optional, REMOVE the below and fill your values if NOT using .env)
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase URL or Anon Key. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file."
  );
}

// Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
