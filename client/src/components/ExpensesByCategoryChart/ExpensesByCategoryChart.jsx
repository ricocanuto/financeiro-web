import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

function formatBRL(value) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function ExpensesByCategoryChart({ data }) {
  return (
    <div className="card">
      <h3 className="card__title">Despesas por categoria</h3>
      <p className="card__subtitle">Situação projetada</p>

      <div style={{ width: "100%", height: 220, marginTop: 8 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="total"
              nameKey="name"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
            >
              {data.map((entry, index) => (
                <Cell key={entry.categoryId || index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => formatBRL(value)} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
        {data.map((entry) => (
          <div
            key={entry.categoryId}
            style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: entry.color,
                  display: "inline-block",
                }}
              />
              {entry.name} {entry.percentage.toFixed(1)}%
            </span>
            <span className="value--negative">-{formatBRL(entry.total)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
