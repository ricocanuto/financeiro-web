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

    const { data, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !data?.user) {
      return res.status(401).json({ message: "Token inválido ou expirado" });
    }

    // Disponibiliza o usuário autenticado nas próximas camadas (controllers)
    req.userId = data.user.id;
    req.userEmail = data.user.email;
    next();
  } catch (err) {
    console.error("[auth] erro ao validar token:", err.message);
    return res.status(500).json({ message: "Erro interno de autenticação" });
  }
}
