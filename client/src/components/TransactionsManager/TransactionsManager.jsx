import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Pencil, Trash2, Camera, Loader2 } from "lucide-react";
import { api } from "../../services/api";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function firstDayOfMonthISO() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}

const emptyForm = {
  accountId: "",
  categoryId: "",
  type: "expense",
  description: "",
  amount: "",
  date: todayISO(),
  confirmed: true,
};

function formatBRL(value) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function TransactionsManager({ onChanged }) {
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [filters, setFilters] = useState({
    from: firstDayOfMonthISO(),
    to: todayISO(),
    accountId: "",
    categoryId: "",
    type: "",
  });

  const fileInputRef = useRef(null);
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState("");
  const [suggestedCategoryName, setSuggestedCategoryName] = useState(null);

  async function loadOptions() {
    const [accountsRes, categoriesRes] = await Promise.all([
      api.get("/accounts"),
      api.get("/categories"),
    ]);
    setAccounts(accountsRes.data);
    setCategories(categoriesRes.data);
  }

  async function loadTransactions() {
    setLoading(true);
    const params = {};
    if (filters.from) params.from = filters.from;
    if (filters.to) params.to = filters.to;
    if (filters.accountId) params.accountId = filters.accountId;
    if (filters.categoryId) params.categoryId = filters.categoryId;
    if (filters.type) params.type = filters.type;

    const { data } = await api.get("/transactions", { params });
    setTransactions(data);
    setLoading(false);
  }

  useEffect(() => {
    loadOptions();
  }, []);

  useEffect(() => {
    loadTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const filteredCategories = useMemo(
    () => categories.filter((c) => c.type === form.type),
    [categories, form.type]
  );

  function startEdit(tx) {
    setEditingId(tx._id);
    setForm({
      accountId: tx.accountId?._id || tx.accountId,
      categoryId: tx.categoryId?._id || tx.categoryId,
      type: tx.type,
      description: tx.description,
      amount: tx.amount,
      date: tx.date.slice(0, 10),
      confirmed: tx.confirmed,
    });
  }

  function resetForm() {
    setEditingId(null);
    setSuggestedCategoryName(null);
    setExtractError("");
    setForm({ ...emptyForm, accountId: accounts[0]?._id || "" });
  }

  async function handlePhotoSelected(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setExtracting(true);
    setExtractError("");
    setSuggestedCategoryName(null);

    try {
      const formData = new FormData();
      formData.append("receipt", file);

      const { data } = await api.post("/receipts/extract", formData);

      setEditingId(null);
      setForm({
        accountId: data.accountId || accounts[0]?._id || "",
        categoryId: data.categoryId || "",
        type: data.type,
        description: data.description,
        amount: data.amount ?? "",
        date: data.date,
        confirmed: true,
      });

      if (data.suggestedCategoryName && !data.categoryId) {
        setSuggestedCategoryName(data.suggestedCategoryName);
      }
    } catch (err) {
      setExtractError(
        err.response?.data?.message ||
          "Não foi possível ler o comprovante. Tente novamente ou preencha manualmente."
      );
    } finally {
      setExtracting(false);
      e.target.value = ""; // permite selecionar a mesma foto de novo, se preciso
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, amount: parseFloat(form.amount) };
    try {
      if (editingId) {
        await api.put(`/transactions/${editingId}`, payload);
      } else {
        await api.post("/transactions", payload);
      }
      resetForm();
      await loadTransactions();
      onChanged?.();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Remover este lançamento?")) return;
    await api.delete(`/transactions/${id}`);
    await loadTransactions();
    onChanged?.();
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <p className="card__subtitle" style={{ margin: 0 }}>
          Preencha manualmente ou envie a foto de um comprovante
        </p>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => fileInputRef.current?.click()}
          disabled={extracting}
        >
          {extracting ? <Loader2 size={16} className="spin" /> : <Camera size={16} />}
          {extracting ? "Lendo comprovante..." : "Lançar por foto"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          style={{ display: "none" }}
          onChange={handlePhotoSelected}
        />
      </div>

      {extractError && <p className="login-card__error">{extractError}</p>}
      {suggestedCategoryName && (
        <p className="card__subtitle" style={{ marginBottom: 12, color: "var(--color-danger)" }}>
          A IA sugeriu a categoria "{suggestedCategoryName}", mas ela ainda não existe. Escolha uma
          categoria abaixo ou cadastre-a antes de salvar.
        </p>
      )}

      <form className="form-grid" onSubmit={handleSubmit}>
        <div className="type-toggle">
          <button
            type="button"
            data-kind="income"
            className={form.type === "income" ? "active" : ""}
            onClick={() => setForm({ ...form, type: "income", categoryId: "" })}
          >
            Receita
          </button>
          <button
            type="button"
            data-kind="expense"
            className={form.type === "expense" ? "active" : ""}
            onClick={() => setForm({ ...form, type: "expense", categoryId: "" })}
          >
            Despesa
          </button>
        </div>

        <div className="form-field">
          <label>Descrição</label>
          <input
            type="text"
            placeholder="Ex: Supermercado, Salário..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-field">
            <label>Valor (R$)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              required
            />
          </div>
          <div className="form-field">
            <label>Data</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-field">
            <label>Conta</label>
            <select
              value={form.accountId}
              onChange={(e) => setForm({ ...form, accountId: e.target.value })}
              required
            >
              <option value="" disabled>Selecione</option>
              {accounts.map((a) => (
                <option key={a._id} value={a._id}>{a.name}</option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label>Categoria</label>
            <select
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              required
            >
              <option value="" disabled>Selecione</option>
              {filteredCategories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--color-text-muted)" }}>
          <input
            type="checkbox"
            checked={form.confirmed}
            onChange={(e) => setForm({ ...form, confirmed: e.target.checked })}
            style={{ width: "auto" }}
          />
          Confirmado (já efetivado na conta, não apenas projetado)
        </label>

        <div className="form-actions">
          {editingId && (
            <button type="button" className="btn btn--ghost" onClick={resetForm}>
              Cancelar
            </button>
          )}
          <button className="btn btn--primary" type="submit" disabled={saving}>
            <Plus size={16} />
            {editingId ? "Salvar alterações" : "Adicionar lançamento"}
          </button>
        </div>
      </form>

      <div className="filters-bar">
        <input
          type="date"
          value={filters.from}
          onChange={(e) => setFilters({ ...filters, from: e.target.value })}
        />
        <input
          type="date"
          value={filters.to}
          onChange={(e) => setFilters({ ...filters, to: e.target.value })}
        />
        <select
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
        >
          <option value="">Tudo</option>
          <option value="income">Entrada</option>
          <option value="expense">Saída</option>
        </select>
        <select
          value={filters.accountId}
          onChange={(e) => setFilters({ ...filters, accountId: e.target.value })}
        >
          <option value="">Todas as contas</option>
          {accounts.map((a) => (
            <option key={a._id} value={a._id}>{a.name}</option>
          ))}
        </select>
        <select
          value={filters.categoryId}
          onChange={(e) => setFilters({ ...filters, categoryId: e.target.value })}
        >
          <option value="">Todas as categorias</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
      </div>

      {loading && <p className="empty-state">Carregando lançamentos...</p>}
      {!loading && transactions.length === 0 && (
        <p className="empty-state">Nenhum lançamento encontrado para esse filtro.</p>
      )}

      {!loading && transactions.length > 0 && (
        <table className="transactions-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Descrição</th>
              <th>Categoria</th>
              <th>Conta</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Valor</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx._id}>
                <td>{new Date(tx.date).toLocaleDateString("pt-BR")}</td>
                <td>{tx.description}</td>
                <td>{tx.categoryId?.name}</td>
                <td>{tx.accountId?.name}</td>
                <td>
                  <span className={`badge ${tx.confirmed ? "badge--confirmed" : "badge--pending"}`}>
                    {tx.confirmed ? "Confirmado" : "Projetado"}
                  </span>
                </td>
                <td
                  style={{ textAlign: "right" }}
                  className={tx.type === "income" ? "value--positive" : "value--negative"}
                >
                  {tx.type === "income" ? "+" : "-"}{formatBRL(tx.amount)}
                </td>
                <td>
                  <div className="manage-row__actions">
                    <button type="button" className="icon-btn" onClick={() => startEdit(tx)}>
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      className="icon-btn icon-btn--danger"
                      onClick={() => handleDelete(tx._id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}