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
      <div className="sidebar__item" onClick={onOpenAccounts}>
        <Wallet size={16} /> Contas
      </div>
      <div className="sidebar__item" onClick={onOpenTransactions}>
        <ArrowLeftRight size={16} /> Lançamentos
      </div>
      <div className="sidebar__item" onClick={onOpenCategories}>
        <Tag size={16} /> Categorias
      </div>

      <div className="sidebar__footer">
        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
          <span>{theme === "light" ? "Modo escuro" : "Modo claro"}</span>
        </button>
        <button className="sidebar__item sidebar__logout" onClick={signOut}>
          <LogOut size={16} /> <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}