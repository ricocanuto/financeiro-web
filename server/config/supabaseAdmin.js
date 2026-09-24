import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  // Falha alto e visível no boot em vez de rodar com credenciais falsas
  // (rodar "quieto" com um projeto fake equivale a desligar a autenticação).
  throw new Error(
    "[supabaseAdmin] SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios. " +
    "Configure-os nas variáveis de ambiente do servidor antes de iniciar."
  );
}

// Client "admin" usado apenas no servidor para validar tokens
// recebidos do front-end. Nunca exponha a SERVICE_ROLE_KEY no client.
// autoRefreshToken/persistSession ficam desligados porque este client
// só faz validações pontuais (auth.getUser) e não deve manter estado
// de sessão entre requisições concorrentes.
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
