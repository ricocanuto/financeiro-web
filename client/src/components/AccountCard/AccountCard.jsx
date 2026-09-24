import Money from "../Money/Money.jsx";

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
              <td>
                <Money
                  value={acc.confirmedBalance}
                  className={acc.confirmedBalance >= 0 ? "value--positive" : "value--negative"}
                />
              </td>
              <td>
                <Money
                  value={acc.projectedBalance}
                  className={acc.projectedBalance >= 0 ? "value--positive" : "value--negative"}
                />
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td>Total</td>
            <td>
              <Money
                value={totals.confirmed}
                className={totals.confirmed >= 0 ? "value--positive" : "value--negative"}
              />
            </td>
            <td>
              <Money
                value={totals.projected}
                className={totals.projected >= 0 ? "value--positive" : "value--negative"}
              />
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
