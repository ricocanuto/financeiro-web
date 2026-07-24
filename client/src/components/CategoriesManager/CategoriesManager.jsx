import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { api } from "../../services/api";

const emptyForm = { name: "", type: "expense", color: "#f5487f", monthlyGoal: "" };

export default function CategoriesManager({ onChanged }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  async function loadCategories() {
    setLoading(true);
    const { data } = await api.get("/categories");
    setCategories(data);
    setLoading(false);
  }

  useEffect(() => {
    loadCategories();
  }, []);

  function startEdit(category) {
    setEditingId(category._id);
    setForm({
      name: category.name,
      type: category.type,
      color: category.color,
      monthlyGoal: category.monthlyGoal ?? "",
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      monthlyGoal: form.monthlyGoal === "" ? null : parseFloat(form.monthlyGoal),
    };
    try {
      if (editingId) {
        await api.put(`/categories/${editingId}`, payload);
      } else {
        await api.post("/categories", payload);
      }
      resetForm();
      await loadCategories();
      onChanged?.();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Remover esta categoria?")) return;
    await api.delete(`/categories/${id}`);
    await loadCategories();
    onChanged?.();
  }

  return (
    <div>
      <form className="form-grid" onSubmit={handleSubmit}>
        <div className="type-toggle">
          <button
            type="button"
            data-kind="income"
            className={form.type === "income" ? "active" : ""}
            onClick={() => setForm({ ...form, type: "income", color: "#0acf83" })}
          >
            Receita
          </button>
          <button
            type="button"
            data-kind="expense"
            className={form.type === "expense" ? "active" : ""}
            onClick={() => setForm({ ...form, type: "expense", color: "#f5487f" })}
          >
            Despesa
          </button>
        </div>

        <div className="form-row">
          <div className="form-field">
            <label>Nome da categoria</label>
            <input
              type="text"
              placeholder="Ex: Moradia, Salário..."
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

        {form.type === "expense" && (
          <div className="form-field">
            <label>Meta mensal (R$, opcional)</label>
            <input
              type="number"
              step="0.01"
              placeholder="Sem meta definida"
              value={form.monthlyGoal}
              onChange={(e) => setForm({ ...form, monthlyGoal: e.target.value })}
            />
          </div>
        )}

        <div className="form-actions">
          {editingId && (
            <button type="button" className="btn btn--ghost" onClick={resetForm}>
              Cancelar
            </button>
          )}
          <button className="btn btn--primary" type="submit" disabled={saving}>
            <Plus size={16} />
            {editingId ? "Salvar alterações" : "Adicionar categoria"}
          </button>
        </div>
      </form>

      <div className="manage-list">
        {loading && <p className="empty-state">Carregando categorias...</p>}
        {!loading && categories.length === 0 && (
          <p className="empty-state">Nenhuma categoria cadastrada ainda.</p>
        )}
        {categories.map((category) => (
          <div className="manage-row" key={category._id}>
            <div className="manage-row__info">
              <span className="manage-row__dot" style={{ backgroundColor: category.color }} />
              {category.name}
              {category.monthlyGoal != null && (
                <span className="card__subtitle" style={{ marginLeft: 4 }}>
                  meta: {category.monthlyGoal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </span>
              )}
            </div>
            <div className="manage-row__actions">
              <button className="icon-btn" onClick={() => startEdit(category)}>
                <Pencil size={15} />
              </button>
              <button
                className="icon-btn icon-btn--danger"
                onClick={() => handleDelete(category._id)}
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
