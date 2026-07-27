import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { supabase } from "../../lib/supabaseClient";

export default function ResetPassword() {
  const { updatePassword } = useAuth();
  const navigate = useNavigate();

  // O Supabase processa o token do link do e-mail automaticamente na URL e
  // cria uma sessão temporária de "recovery". Só liberamos o formulário
  // depois de confirmar que essa sessão existe.
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasRecoverySession, setHasRecoverySession] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setHasRecoverySession(!!data.session);
      setCheckingSession(false);
    });
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }

    setSubmitting(true);
    try {
      await updatePassword(password);
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.message || "Não foi possível redefinir a senha");
    } finally {
      setSubmitting(false);
    }
  }

  if (checkingSession) {
    return (
      <div className="login-page">
        <p className="card__subtitle">Verificando link de recuperação...</p>
      </div>
    );
  }

  if (!hasRecoverySession) {
    return (
      <div className="login-page">
        <div className="card login-card">
          <p className="login-card__error">
            Este link de recuperação é inválido ou já expirou. Solicite um novo na tela de login.
          </p>
          <button className="btn btn--primary" style={{ width: "100%" }} onClick={() => navigate("/login")}>
            Voltar para o login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="card login-card">
        <h1 className="card__title" style={{ fontSize: 20, marginBottom: 4 }}>
          Nova senha
        </h1>
        <p className="card__subtitle" style={{ marginBottom: 20 }}>
          Escolha uma nova senha para sua conta
        </p>

        {error && <p className="login-card__error">{error}</p>}
        {success && (
          <p className="login-card__success">Senha redefinida! Redirecionando para o login...</p>
        )}

        {!success && (
          <form onSubmit={handleSubmit}>
            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Nova senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <button
                type="button"
                className="password-field__toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <input
              type={showPassword ? "text" : "password"}
              placeholder="Confirme a nova senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
            />

            <button className="btn btn--primary" type="submit" disabled={submitting}>
              {submitting ? "Salvando..." : "Redefinir senha"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
