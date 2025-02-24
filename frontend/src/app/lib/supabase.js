// src/lib/supabase.js

import { createClient } from "@supabase/supabase-js";

// Supabase URL and Key are loaded from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY;

// Create a Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);
console.log("Supabase URL:", supabaseUrl);
console.log("Supabase Key:", supabaseKey);
