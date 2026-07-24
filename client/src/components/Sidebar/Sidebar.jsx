import { Moon, Sun, LogOut, Wallet, Tag, ArrowLeftRight } from "lucide-react";
import { useTheme } from "../../context/ThemeContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

export default function Sidebar({ onOpenAccounts, onOpenCategories, onOpenTransactions }) {
  const { theme, toggleTheme } = useTheme();
  const { signOut } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar__logo">Financeiro Web</div>

      <div className="sidebar__item sidebar__item--active">Visão geral</div>
      <div
        className="sidebar__item"
        style={{ display: "flex", alignItems: "center", gap: 8 }}
        onClick={onOpenAccounts}
      >
        <Wallet size={16} /> Contas
      </div>
      <div
        className="sidebar__item"
        style={{ display: "flex", alignItems: "center", gap: 8 }}
        onClick={onOpenTransactions}
      >
        <ArrowLeftRight size={16} /> Lançamentos
      </div>
      <div
        className="sidebar__item"
        style={{ display: "flex", alignItems: "center", gap: 8 }}
        onClick={onOpenCategories}
      >
        <Tag size={16} /> Categorias
      </div>

      <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
          {theme === "light" ? "Modo escuro" : "Modo claro"}
        </button>
        <button className="sidebar__item" onClick={signOut} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <LogOut size={16} /> Sair
        </button>
      </div>
    </aside>
  );
}
