import { createClient } from "@supabase/supabase-js";

// Client "admin" usado apenas no servidor para validar tokens
// recebidos do front-end. Nunca exponha a SERVICE_ROLE_KEY no client.
const supabaseUrl = process.env.SUPABASE_URL || "https://dummyproject.supabase.co";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy";

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

