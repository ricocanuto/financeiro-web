import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

export default function Login() {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState("signin"); // "signin" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      if (mode === "signin") {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
      navigate("/");
    } catch (err) {
      setError(err.message || "Não foi possível autenticar");
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
          {mode === "signin" ? "Entre na sua conta" : "Crie sua conta"}
        </p>

        {error && <p className="login-card__error">{error}</p>}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
          <button className="btn btn--primary" type="submit" disabled={submitting}>
            {submitting
              ? "Aguarde..."
              : mode === "signin"
              ? "Entrar"
              : "Cadastrar"}
          </button>
        </form>

        <button
          className="btn btn--ghost"
          style={{ width: "100%", marginTop: 12 }}
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        >
          {mode === "signin" ? "Criar uma conta" : "Já tenho conta"}
        </button>
      </div>
    </div>
  );
}
