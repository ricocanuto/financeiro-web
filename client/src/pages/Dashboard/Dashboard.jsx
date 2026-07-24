import { useEffect, useState, useCallback } from "react";
import { Plus } from "lucide-react";
import { api } from "../../services/api";
import Sidebar from "../../components/Sidebar/Sidebar.jsx";
import AccountCard from "../../components/AccountCard/AccountCard.jsx";
import CashFlowChart from "../../components/CashFlowChart/CashFlowChart.jsx";
import ExpensesByCategoryChart from "../../components/ExpensesByCategoryChart/ExpensesByCategoryChart.jsx";
import MonthResultCard from "../../components/MonthResultCard/MonthResultCard.jsx";
import Drawer from "../../components/Drawer/Drawer.jsx";
import AccountsManager from "../../components/AccountsManager/AccountsManager.jsx";
import CategoriesManager from "../../components/CategoriesManager/CategoriesManager.jsx";
import TransactionsManager from "../../components/TransactionsManager/TransactionsManager.jsx";

function currentMonth() {
  return new Date().toISOString().slice(0, 7); // "YYYY-MM"
}

export default function Dashboard() {
  const [balances, setBalances] = useState(null);
  const [cashFlow, setCashFlow] = useState([]);
  const [expensesByCategory, setExpensesByCategory] = useState([]);
  const [monthResult, setMonthResult] = useState(null);
  const [loading, setLoading] = useState(true);

  const [openDrawer, setOpenDrawer] = useState(null); // "accounts" | "categories" | "transactions" | null

  const loadDashboard = useCallback(() => {
    const month = currentMonth();

    return Promise.all([
      api.get("/dashboard/balances"),
      api.get("/dashboard/cashflow"),
      api.get("/dashboard/expenses-by-category", { params: { month } }),
      api.get("/dashboard/month-result", { params: { month } }),
    ])
      .then(([balancesRes, cashFlowRes, expensesRes, resultRes]) => {
        setBalances(balancesRes.data);
        setCashFlow(cashFlowRes.data);
        setExpensesByCategory(expensesRes.data);
        setMonthResult(resultRes.data);
      })
      .catch((err) => console.error("[dashboard] erro ao carregar dados:", err));
  }, []);

  useEffect(() => {
    loadDashboard().finally(() => setLoading(false));
  }, [loadDashboard]);

  // Toda vez que algo é criado/editado/apagado num drawer, o dashboard recarrega
  // silenciosamente (sem mostrar o loading de tela cheia de novo).
  function handleChanged() {
    loadDashboard();
  }

  return (
    <div className="app-layout">
      <Sidebar
        onOpenAccounts={() => setOpenDrawer("accounts")}
        onOpenCategories={() => setOpenDrawer("categories")}
        onOpenTransactions={() => setOpenDrawer("transactions")}
      />

      <main className="dashboard-content">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1 className="card__title" style={{ fontSize: 22 }}>
            Visão geral
          </h1>
          <button className="btn btn--primary" onClick={() => setOpenDrawer("transactions")}>
            <Plus size={16} /> Novo lançamento
          </button>
        </div>

        {loading ? (
          <p className="card__subtitle" style={{ marginTop: 16 }}>
            Carregando seus dados...
          </p>
        ) : (
          <div className="dashboard-grid">
            <AccountCard balances={balances} />
            <MonthResultCard result={monthResult} />
            <CashFlowChart data={cashFlow} />
            <ExpensesByCategoryChart data={expensesByCategory} />
          </div>
        )}
      </main>

      <Drawer
        title="Contas"
        open={openDrawer === "accounts"}
        onClose={() => setOpenDrawer(null)}
      >
        <AccountsManager onChanged={handleChanged} />
      </Drawer>

      <Drawer
        title="Categorias"
        open={openDrawer === "categories"}
        onClose={() => setOpenDrawer(null)}
      >
        <CategoriesManager onChanged={handleChanged} />
      </Drawer>

      <Drawer
        title="Lançamentos"
        open={openDrawer === "transactions"}
        onClose={() => setOpenDrawer(null)}
        width={720}
      >
        <TransactionsManager onChanged={handleChanged} />
      </Drawer>
    </div>
  );
}
