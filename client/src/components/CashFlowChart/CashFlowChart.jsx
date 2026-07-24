import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function CashFlowChart({ data }) {
  return (
    <div className="card" style={{ gridColumn: "span 2" }}>
      <h3 className="card__title">Fluxo de caixa</h3>

      <div style={{ width: "100%", height: 260, marginTop: 16 }}>
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid vertical={false} stroke="var(--color-border)" />
            <XAxis
              dataKey="date"
              tickFormatter={(d) => d.slice(8, 10) + "/" + d.slice(5, 7)}
              stroke="var(--color-text-muted)"
              fontSize={12}
            />
            <YAxis stroke="var(--color-text-muted)" fontSize={12} />
            <Tooltip
              formatter={(value) =>
                value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
              }
              labelFormatter={(d) => `Dia ${d}`}
            />
            <Line
              type="monotone"
              dataKey="balance"
              stroke="var(--color-text-muted)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
