// src/lib/supabase.js

import { createClient } from "@supabase/supabase-js";

// Supabase URL and Key are loaded from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create a Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);
console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log("Supabase Key:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
