function formatBRL(value) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function AccountCard({ balances }) {
  if (!balances) return null;

  const { accounts, totals } = balances;

  return (
    <div className="card">
      <h3 className="card__title">Saldos de caixa</h3>

      <table className="balance-table" style={{ marginTop: 16 }}>
        <thead>
          <tr>
            <th></th>
            <th>Confirmado</th>
            <th>Projetado</th>
          </tr>
        </thead>
        <tbody>
          {accounts.map((acc) => (
            <tr key={acc.accountId}>
              <td>{acc.name}</td>
              <td className={acc.confirmedBalance >= 0 ? "value--positive" : "value--negative"}>
                {formatBRL(acc.confirmedBalance)}
              </td>
              <td className={acc.projectedBalance >= 0 ? "value--positive" : "value--negative"}>
                {formatBRL(acc.projectedBalance)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td>Total</td>
            <td className={totals.confirmed >= 0 ? "value--positive" : "value--negative"}>
              {formatBRL(totals.confirmed)}
            </td>
            <td className={totals.projected >= 0 ? "value--positive" : "value--negative"}>
              {formatBRL(totals.projected)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
