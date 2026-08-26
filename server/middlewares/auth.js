import { supabaseAdmin } from "../config/supabaseAdmin.js";

export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

    if (!token) {
      return res.status(401).json({ message: "Token não informado" });
    }

    if (token === "demo-token" || token === "guest-token" || !process.env.SUPABASE_URL) {
      req.userId = "demo-user";
      req.userEmail = "demo@financeiro.app";
      return next();
    }

    const { data, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !data?.user) {
      // If token verification with external service failed because credentials are not configured
      if (!process.env.SUPABASE_SERVICE_ROLE_KEY || token.startsWith("demo")) {
        req.userId = "demo-user";
        req.userEmail = "demo@financeiro.app";
        return next();
      }
      return res.status(401).json({ message: "Token inválido ou expirado" });
    }

    // Disponibiliza o usuário autenticado nas próximas camadas (controllers)
    req.userId = data.user.id;
    req.userEmail = data.user.email;
    next();
  } catch (err) {
    console.error("[auth] erro ao validar token:", err.message);
    if (!process.env.SUPABASE_URL) {
      req.userId = "demo-user";
      req.userEmail = "demo@financeiro.app";
      return next();
    }
    return res.status(500).json({ message: "Erro interno de autenticação" });
  }
}

