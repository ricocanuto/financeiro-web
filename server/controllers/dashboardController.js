import mongoose from "mongoose";
import Account from "../models/Account.js";
import Transaction from "../models/Transaction.js";

const { Types } = mongoose;

// GET /api/dashboard/balances
// Card "Saldos de caixa": saldo confirmado x projetado por conta
export async function getBalances(req, res) {
  const userId = req.userId;
  const accounts = await Account.find({ userId });

  const results = await Promise.all(
    accounts.map(async (account) => {
      const [agg] = await Transaction.aggregate([
        { $match: { userId, accountId: account._id } },
        {
          $group: {
            _id: null,
            confirmed: {
              $sum: {
                $cond: [
                  "$confirmed",
                  {
                    $cond: [{ $eq: ["$type", "income"] }, "$amount", { $multiply: ["$amount", -1] }],
                  },
                  0,
                ],
              },
            },
            projected: {
              $sum: {
                $cond: [{ $eq: ["$type", "income"] }, "$amount", { $multiply: ["$amount", -1] }],
              },
            },
          },
        },
      ]);

      const confirmedBalance = account.initialBalance + (agg?.confirmed || 0);
      const projectedBalance = account.initialBalance + (agg?.projected || 0);

      return {
        accountId: account._id,
        name: account.name,
        icon: account.icon,
        color: account.color,
        confirmedBalance,
        projectedBalance,
      };
    })
  );

  const totals = results.reduce(
    (acc, cur) => ({
      confirmed: acc.confirmed + cur.confirmedBalance,
      projected: acc.projected + cur.projectedBalance,
    }),
    { confirmed: 0, projected: 0 }
  );

  res.json({ accounts: results, totals });
}

// GET /api/dashboard/cashflow?from=2026-07-01&to=2026-07-31
// Gráfico "Fluxo de caixa": saldo acumulado dia a dia
export async function getCashFlow(req, res) {
  const userId = req.userId;
  const { from, to } = req.query;

  const dateFilter = {};
  if (from) dateFilter.$gte = new Date(from);
  if (to) dateFilter.$lte = new Date(to);

  const dailyTotals = await Transaction.aggregate([
    {
      $match: {
        userId,
        ...(from || to ? { date: dateFilter } : {}),
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
        net: {
          $sum: {
            $cond: [{ $eq: ["$type", "income"] }, "$amount", { $multiply: ["$amount", -1] }],
          },
        },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const accounts = await Account.find({ userId });
  const startingBalance = accounts.reduce((sum, a) => sum + a.initialBalance, 0);

  let running = startingBalance;
  const series = dailyTotals.map((day) => {
    running += day.net;
    return { date: day._id, balance: running };
  });

  res.json(series);
}

// GET /api/dashboard/expenses-by-category?month=2026-07
// Gráfico de pizza "Despesas por categoria"
export async function getExpensesByCategory(req, res) {
  const userId = req.userId;
  const { month } = req.query; // formato "YYYY-MM"

  const matchStage = { userId, type: "expense" };
  if (month) {
    const start = new Date(`${month}-01T00:00:00`);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);
    matchStage.date = { $gte: start, $lt: end };
  }

  const results = await Transaction.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: "$categoryId",
        total: { $sum: "$amount" },
      },
    },
    {
      $lookup: {
        from: "categories",
        localField: "_id",
        foreignField: "_id",
        as: "category",
      },
    },
    { $unwind: "$category" },
    { $sort: { total: -1 } },
  ]);

  const grandTotal = results.reduce((sum, r) => sum + r.total, 0);

  const data = results.map((r) => ({
    categoryId: r._id,
    name: r.category.name,
    color: r.category.color,
    total: r.total,
    percentage: grandTotal ? (r.total / grandTotal) * 100 : 0,
  }));

  res.json(data);
}

// GET /api/dashboard/month-result?month=2026-07
// Card "Resultado do mês": receitas x despesas
export async function getMonthResult(req, res) {
  const userId = req.userId;
  const { month } = req.query;

  const matchStage = { userId };
  if (month) {
    const start = new Date(`${month}-01T00:00:00`);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);
    matchStage.date = { $gte: start, $lt: end };
  }

  const [result] = await Transaction.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        income: {
          $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] },
        },
        expense: {
          $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] },
        },
      },
    },
  ]);

  const income = result?.income || 0;
  const expense = result?.expense || 0;

  res.json({ income, expense: -expense, result: income - expense });
}
