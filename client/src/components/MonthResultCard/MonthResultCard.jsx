import { BarChart, Bar, ResponsiveContainer, Cell } from "recharts";

function formatBRL(value) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function MonthResultCard({ result }) {
  if (!result) return null;

  const chartData = [
    { name: "Receitas", value: result.income },
    { name: "Despesas", value: Math.abs(result.expense) },
  ];

  return (
    <div className="card">
      <h3 className="card__title">Resultado do mês</h3>
      <p className="card__subtitle">Situação projetada</p>

      <div style={{ width: "100%", height: 160, marginTop: 8 }}>
        <ResponsiveContainer>
          <BarChart data={chartData}>
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              <Cell fill="var(--chart-income)" />
              <Cell fill="var(--chart-expense)" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8, fontSize: 13 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>● Receitas</span>
          <span className="value--positive">{formatBRL(result.income)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>● Despesas</span>
          <span className="value--negative">{formatBRL(result.expense)}</span>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 12,
          paddingTop: 12,
          borderTop: "1px solid var(--color-border)",
          fontWeight: 700,
        }}
      >
        <span>Resultado</span>
        <span>{formatBRL(result.result)}</span>
      </div>
    </div>
  );
}
