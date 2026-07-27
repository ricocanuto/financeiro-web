import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

export default function Login() {
  const { signIn, signUp, sendPasswordReset } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState("signin"); // "signin" | "signup" | "forgot"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function switchMode(nextMode) {
    setMode(nextMode);
    setError("");
    setSuccessMessage("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setSubmitting(true);

    try {
      if (mode === "forgot") {
        await sendPasswordReset(email);
        setSuccessMessage(
          "Enviamos um link de recuperação para o seu e-mail. Confira também a caixa de spam."
        );
      } else if (mode === "signin") {
        await signIn(email, password);
        navigate("/");
      } else {
        await signUp(email, password);
        navigate("/");
      }
    } catch (err) {
      setError(err.message || "Não foi possível concluir a operação");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-page">
      <div className="card login-card">
        <h1 className="card__title" style={{ fontSize: 20, marginBottom: 4 }}>
          Financeiro Web
        </h1>
        <p className="card__subtitle" style={{ marginBottom: 20 }}>
          {mode === "signin" && "Entre na sua conta"}
          {mode === "signup" && "Crie sua conta"}
          {mode === "forgot" && "Recupere o acesso à sua conta"}
        </p>

        {error && <p className="login-card__error">{error}</p>}
        {successMessage && <p className="login-card__success">{successMessage}</p>}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {mode !== "forgot" && (
            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Senha"
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
          )}

          {mode === "signin" && (
            <button
              type="button"
              className="login-card__link"
              onClick={() => switchMode("forgot")}
            >
              Esqueci minha senha
            </button>
          )}

          <button className="btn btn--primary" type="submit" disabled={submitting}>
            {submitting && "Aguarde..."}
            {!submitting && mode === "signin" && "Entrar"}
            {!submitting && mode === "signup" && "Cadastrar"}
            {!submitting && mode === "forgot" && "Enviar link de recuperação"}
          </button>
        </form>

        {mode === "forgot" ? (
          <button
            type="button"
            className="btn btn--ghost"
            style={{ width: "100%", marginTop: 12 }}
            onClick={() => switchMode("signin")}
          >
            Voltar para o login
          </button>
        ) : (
          <button
            type="button"
            className="btn btn--ghost"
            style={{ width: "100%", marginTop: 12 }}
            onClick={() => switchMode(mode === "signin" ? "signup" : "signin")}
          >
            {mode === "signin" ? "Criar uma conta" : "Já tenho conta"}
          </button>
        )}
      </div>
    </div>
  );
}
