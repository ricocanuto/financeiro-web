import { createClient } from "@supabase/supabase-js";

// Client "admin" usado apenas no servidor para validar tokens
// recebidos do front-end. Nunca exponha a SERVICE_ROLE_KEY no client.
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
