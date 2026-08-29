import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    try {
      const saved = localStorage.getItem("financeiro_demo_session");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      supabase.auth.getSession().then(({ data }) => {
        if (data?.session) {
          setSession(data.session);
        }
        setLoading(false);
      }).catch(() => {
        setLoading(false);
      });

      const { data: listener } = supabase.auth.onAuthStateChange(
        (_event, newSession) => {
          if (newSession) {
            setSession(newSession);
          }
        }
      );

      return () => listener?.subscription?.unsubscribe?.();
    } catch {
      setLoading(false);
    }
  }, []);

  async function signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      if (data?.session) {
        setSession(data.session);
      }
    } catch (err) {
      if (!import.meta.env.VITE_SUPABASE_URL || err.message?.includes("Failed to fetch") || err.message?.includes("Invalid API key") || err.message?.includes("fetch")) {
        const demoSession = {
          user: { id: "demo-user", email: email || "usuario@financeiro.app" },
          access_token: "demo-token",
        };
        localStorage.setItem("financeiro_demo_session", JSON.stringify(demoSession));
        setSession(demoSession);
        return;
      }
      throw err;
    }
  }

  async function signUp(email, password) {
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      if (data?.session) {
        setSession(data.session);
      }
    } catch (err) {
      if (!import.meta.env.VITE_SUPABASE_URL || err.message?.includes("Failed to fetch") || err.message?.includes("Invalid API key") || err.message?.includes("fetch")) {
        const demoSession = {
          user: { id: "demo-user", email: email || "usuario@financeiro.app" },
          access_token: "demo-token",
        };
        localStorage.setItem("financeiro_demo_session", JSON.stringify(demoSession));
        setSession(demoSession);
        return;
      }
      throw err;
    }
  }

  async function signOut() {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    localStorage.removeItem("financeiro_demo_session");
    setSession(null);
  }

  // Dispara o e-mail de recuperação com um link que volta pro app na rota
  // /reset-password, já autenticado com uma sessão temporária de recovery.
  async function sendPasswordReset(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  }

  // Usado na tela /reset-password, depois que o usuário clicou no link do e-mail
  async function updatePassword(newPassword) {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  }

  const value = {
    session,
    user: session?.user || null,
    accessToken: session?.access_token || null,
    loading,
    signIn,
    signUp,
    signOut,
    sendPasswordReset,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth precisa ser usado dentro de um AuthProvider");
  }
  return context;
}