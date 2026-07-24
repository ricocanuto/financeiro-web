import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Wallet } from "lucide-react";
import { api } from "../../services/api";

const emptyForm = { name: "", color: "#0acf83", initialBalance: 0, includeInTotal: true };

export default function AccountsManager({ onChanged }) {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  async function loadAccounts() {
    setLoading(true);
    const { data } = await api.get("/accounts");
    setAccounts(data);
    setLoading(false);
  }

  useEffect(() => {
    loadAccounts();
  }, []);

  function startEdit(account) {
    setEditingId(account._id);
    setForm({
      name: account.name,
      color: account.color,
      initialBalance: account.initialBalance,
      includeInTotal: account.includeInTotal,
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/accounts/${editingId}`, form);
      } else {
        await api.post("/accounts", form);
      }
      resetForm();
      await loadAccounts();
      onChanged?.();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Remover esta conta? Os lançamentos vinculados não serão apagados.")) return;
    await api.delete(`/accounts/${id}`);
    await loadAccounts();
    onChanged?.();
  }

  return (
    <div>
      <form className="form-grid" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-field">
            <label>Nome da conta</label>
            <input
              type="text"
              placeholder="Ex: Nubank, Carteira..."
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="form-field">
            <label>Cor</label>
            <input
              type="color"
              value={form.color}
              onChange={(e) => setForm({ ...form, color: e.target.value })}
              style={{ padding: 2, height: 38 }}
            />
          </div>
        </div>

        <div className="form-field">
          <label>Saldo inicial (R$)</label>
          <input
            type="number"
            step="0.01"
            value={form.initialBalance}
            onChange={(e) =>
              setForm({ ...form, initialBalance: parseFloat(e.target.value) || 0 })
            }
          />
        </div>

        <div className="form-actions">
          {editingId && (
            <button type="button" className="btn btn--ghost" onClick={resetForm}>
              Cancelar
            </button>
          )}
          <button className="btn btn--primary" type="submit" disabled={saving}>
            <Plus size={16} />
            {editingId ? "Salvar alterações" : "Adicionar conta"}
          </button>
        </div>
      </form>

      <div className="manage-list">
        {loading && <p className="empty-state">Carregando contas...</p>}
        {!loading && accounts.length === 0 && (
          <p className="empty-state">Nenhuma conta cadastrada ainda.</p>
        )}
        {accounts.map((account) => (
          <div className="manage-row" key={account._id}>
            <div className="manage-row__info">
              <Wallet size={16} color={account.color} />
              {account.name}
            </div>
            <div className="manage-row__actions">
              <button className="icon-btn" onClick={() => startEdit(account)}>
                <Pencil size={15} />
              </button>
              <button
                className="icon-btn icon-btn--danger"
                onClick={() => handleDelete(account._id)}
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
