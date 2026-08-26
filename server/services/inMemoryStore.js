// Armazenamento em memória com dados iniciais ricos para funcionamento instantâneo em preview
import crypto from "crypto";

const initialAccounts = [
  {
    _id: "acc_1",
    userId: "demo-user",
    name: "Conta Corrente",
    icon: "landmark",
    color: "#0acf83",
    initialBalance: 3200,
    includeInTotal: true,
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    _id: "acc_2",
    userId: "demo-user",
    name: "Carteira",
    icon: "wallet",
    color: "#3ba7f0",
    initialBalance: 450,
    includeInTotal: true,
    createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
  },
  {
    _id: "acc_3",
    userId: "demo-user",
    name: "Reserva de Emergência",
    icon: "piggy-bank",
    color: "#f5a623",
    initialBalance: 12000,
    includeInTotal: true,
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
];

const initialCategories = [
  {
    _id: "cat_1",
    userId: "demo-user",
    name: "Salário",
    type: "income",
    color: "#0acf83",
    monthlyGoal: 6500,
  },
  {
    _id: "cat_2",
    userId: "demo-user",
    name: "Freelance",
    type: "income",
    color: "#3ba7f0",
    monthlyGoal: 1500,
  },
  {
    _id: "cat_3",
    userId: "demo-user",
    name: "Alimentação & Mercado",
    type: "expense",
    color: "#f5487f",
    monthlyGoal: 1400,
  },
  {
    _id: "cat_4",
    userId: "demo-user",
    name: "Moradia & Contas",
    type: "expense",
    color: "#f5a623",
    monthlyGoal: 1900,
  },
  {
    _id: "cat_5",
    userId: "demo-user",
    name: "Transporte",
    type: "expense",
    color: "#9b51e0",
    monthlyGoal: 450,
  },
  {
    _id: "cat_6",
    userId: "demo-user",
    name: "Lazer & Cultura",
    type: "expense",
    color: "#00c896",
    monthlyGoal: 500,
  },
];

const today = new Date();
const currentMonthStr = today.toISOString().slice(0, 7); // "YYYY-MM"

function dateInCurrentMonth(day) {
  const d = String(day).padStart(2, "0");
  return `${currentMonthStr}-${d}`;
}

const initialTransactions = [
  {
    _id: "tx_1",
    userId: "demo-user",
    accountId: "acc_1",
    categoryId: "cat_1",
    type: "income",
    description: "Salário Mensal",
    amount: 6500,
    date: new Date(`${dateInCurrentMonth(5)}T10:00:00Z`),
    confirmed: true,
  },
  {
    _id: "tx_2",
    userId: "demo-user",
    accountId: "acc_1",
    categoryId: "cat_4",
    type: "expense",
    description: "Aluguel e Condomínio",
    amount: 1750,
    date: new Date(`${dateInCurrentMonth(8)}T12:00:00Z`),
    confirmed: true,
  },
  {
    _id: "tx_3",
    userId: "demo-user",
    accountId: "acc_1",
    categoryId: "cat_3",
    type: "expense",
    description: "Supermercado Mensal",
    amount: 680.5,
    date: new Date(`${dateInCurrentMonth(10)}T15:30:00Z`),
    confirmed: true,
  },
  {
    _id: "tx_4",
    userId: "demo-user",
    accountId: "acc_2",
    categoryId: "cat_5",
    type: "expense",
    description: "Combustível",
    amount: 220,
    date: new Date(`${dateInCurrentMonth(14)}T09:15:00Z`),
    confirmed: true,
  },
  {
    _id: "tx_5",
    userId: "demo-user",
    accountId: "acc_1",
    categoryId: "cat_2",
    type: "income",
    description: "Projeto Consultoria Web",
    amount: 1200,
    date: new Date(`${dateInCurrentMonth(18)}T16:00:00Z`),
    confirmed: true,
  },
  {
    _id: "tx_6",
    userId: "demo-user",
    accountId: "acc_2",
    categoryId: "cat_6",
    type: "expense",
    description: "Jantar Restaurante",
    amount: 145.9,
    date: new Date(`${dateInCurrentMonth(20)}T20:45:00Z`),
    confirmed: true,
  },
  {
    _id: "tx_7",
    userId: "demo-user",
    accountId: "acc_1",
    categoryId: "cat_3",
    type: "expense",
    description: "Compras Feira & Padaria",
    amount: 125.4,
    date: new Date(`${dateInCurrentMonth(22)}T11:00:00Z`),
    confirmed: false,
  },
];

let accounts = [...initialAccounts];
let categories = [...initialCategories];
let transactions = [...initialTransactions];

function generateId(prefix = "id") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// User-scoped data access
function getAccountList(userId) {
  return accounts.filter((a) => a.userId === userId || userId === "demo-user");
}

function getCategoryList(userId, type) {
  return categories.filter((c) => {
    const userMatch = c.userId === userId || userId === "demo-user";
    if (!userMatch) return false;
    if (type && c.type !== type) return false;
    return true;
  });
}

function getTransactionList(userId, filters = {}) {
  const { from, to, accountId, categoryId, type } = filters;
  return transactions
    .filter((t) => {
      if (t.userId !== userId && userId !== "demo-user") return false;
      if (accountId && t.accountId !== accountId) return false;
      if (categoryId && t.categoryId !== categoryId) return false;
      if (type && t.type !== type) return false;
      if (from && new Date(t.date) < new Date(from)) return false;
      if (to && new Date(t.date) > new Date(to)) return false;
      return true;
    })
    .map((t) => {
      const account = accounts.find((a) => a._id === t.accountId);
      const category = categories.find((c) => c._id === t.categoryId);
      return {
        ...t,
        accountId: account ? { _id: account._id, name: account.name, color: account.color, icon: account.icon } : t.accountId,
        categoryId: category ? { _id: category._id, name: category.name, color: category.color, type: category.type } : t.categoryId,
      };
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

export const inMemoryStore = {
  // Accounts
  listAccounts(userId) {
    return getAccountList(userId);
  },
  createAccount(userId, data) {
    const newAcc = {
      _id: generateId("acc"),
      userId,
      name: data.name,
      icon: data.icon || "wallet",
      color: data.color || "#0acf83",
      initialBalance: Number(data.initialBalance) || 0,
      includeInTotal: data.includeInTotal !== false,
      createdAt: new Date().toISOString(),
    };
    accounts.push(newAcc);
    return newAcc;
  },
  updateAccount(userId, id, data) {
    const index = accounts.findIndex((a) => a._id === id);
    if (index === -1) return null;
    accounts[index] = { ...accounts[index], ...data };
    return accounts[index];
  },
  deleteAccount(userId, id) {
    const prevLen = accounts.length;
    accounts = accounts.filter((a) => a._id !== id);
    // Remove related transactions
    transactions = transactions.filter((t) => t.accountId !== id);
    return accounts.length < prevLen;
  },

  // Categories
  listCategories(userId, type) {
    return getCategoryList(userId, type);
  },
  createCategory(userId, data) {
    const newCat = {
      _id: generateId("cat"),
      userId,
      name: data.name,
      type: data.type,
      color: data.color || "#0acf83",
      monthlyGoal: Number(data.monthlyGoal) || 0,
    };
    categories.push(newCat);
    return newCat;
  },
  updateCategory(userId, id, data) {
    const index = categories.findIndex((c) => c._id === id);
    if (index === -1) return null;
    categories[index] = { ...categories[index], ...data };
    return categories[index];
  },
  deleteCategory(userId, id) {
    const prevLen = categories.length;
    categories = categories.filter((c) => c._id !== id);
    return categories.length < prevLen;
  },

  // Transactions
  listTransactions(userId, filters) {
    return getTransactionList(userId, filters);
  },
  createTransaction(userId, data) {
    const newTx = {
      _id: generateId("tx"),
      userId,
      accountId: data.accountId,
      categoryId: data.categoryId,
      type: data.type,
      description: data.description,
      amount: Number(data.amount),
      date: new Date(data.date),
      confirmed: Boolean(data.confirmed),
    };
    transactions.push(newTx);
    const account = accounts.find((a) => a._id === newTx.accountId);
    const category = categories.find((c) => c._id === newTx.categoryId);
    return {
      ...newTx,
      accountId: account ? { _id: account._id, name: account.name, color: account.color, icon: account.icon } : newTx.accountId,
      categoryId: category ? { _id: category._id, name: category.name, color: category.color, type: category.type } : newTx.categoryId,
    };
  },
  updateTransaction(userId, id, data) {
    const index = transactions.findIndex((t) => t._id === id);
    if (index === -1) return null;
    if (data.amount !== undefined) data.amount = Number(data.amount);
    if (data.date !== undefined) data.date = new Date(data.date);
    transactions[index] = { ...transactions[index], ...data };
    return transactions[index];
  },
  deleteTransaction(userId, id) {
    const prevLen = transactions.length;
    transactions = transactions.filter((t) => t._id !== id);
    return transactions.length < prevLen;
  },

  // Dashboard Balances
  getBalances(userId) {
    const userAccs = getAccountList(userId);
    const results = userAccs.map((account) => {
      const accTx = transactions.filter((t) => (t.userId === userId || userId === "demo-user") && t.accountId === account._id);
      let confirmed = 0;
      let projected = 0;

      for (const t of accTx) {
        const net = t.type === "income" ? t.amount : -t.amount;
        if (t.confirmed) {
          confirmed += net;
        }
        projected += net;
      }

      return {
        accountId: account._id,
        name: account.name,
        icon: account.icon,
        color: account.color,
        confirmedBalance: account.initialBalance + confirmed,
        projectedBalance: account.initialBalance + projected,
      };
    });

    const totals = results.reduce(
      (acc, cur) => ({
        confirmed: acc.confirmed + cur.confirmedBalance,
        projected: acc.projected + cur.projectedBalance,
      }),
      { confirmed: 0, projected: 0 }
    );

    return { accounts: results, totals };
  },

  // Dashboard Cashflow
  getCashFlow(userId, from, to) {
    const userTx = transactions.filter((t) => {
      if (t.userId !== userId && userId !== "demo-user") return false;
      const tDate = new Date(t.date);
      if (from && tDate < new Date(from)) return false;
      if (to && tDate > new Date(to)) return false;
      return true;
    });

    const mapByDate = {};
    for (const t of userTx) {
      const dStr = new Date(t.date).toISOString().slice(0, 10);
      const net = t.type === "income" ? t.amount : -t.amount;
      mapByDate[dStr] = (mapByDate[dStr] || 0) + net;
    }

    const sortedDates = Object.keys(mapByDate).sort();
    const userAccs = getAccountList(userId);
    const startingBalance = userAccs.reduce((sum, a) => sum + (a.includeInTotal ? a.initialBalance : 0), 0);

    let running = startingBalance;
    return sortedDates.map((date) => {
      running += mapByDate[date];
      return { date, balance: running };
    });
  },

  // Dashboard Expenses by Category
  getExpensesByCategory(userId, month) {
    const userTx = transactions.filter((t) => {
      if (t.userId !== userId && userId !== "demo-user") return false;
      if (t.type !== "expense") return false;
      if (month) {
        const txMonth = new Date(t.date).toISOString().slice(0, 7);
        if (txMonth !== month) return false;
      }
      return true;
    });

    const mapByCategory = {};
    for (const t of userTx) {
      mapByCategory[t.categoryId] = (mapByCategory[t.categoryId] || 0) + t.amount;
    }

    const catIds = Object.keys(mapByCategory);
    const grandTotal = Object.values(mapByCategory).reduce((sum, val) => sum + val, 0);

    return catIds
      .map((catId) => {
        const cat = categories.find((c) => c._id === catId);
        const total = mapByCategory[catId];
        return {
          categoryId: catId,
          name: cat ? cat.name : "Outros",
          color: cat ? cat.color : "#9aa1ac",
          total,
          percentage: grandTotal ? (total / grandTotal) * 100 : 0,
        };
      })
      .sort((a, b) => b.total - a.total);
  },

  // Dashboard Month Result
  getMonthResult(userId, month) {
    const userTx = transactions.filter((t) => {
      if (t.userId !== userId && userId !== "demo-user") return false;
      if (month) {
        const txMonth = new Date(t.date).toISOString().slice(0, 7);
        if (txMonth !== month) return false;
      }
      return true;
    });

    let income = 0;
    let expense = 0;

    for (const t of userTx) {
      if (t.type === "income") {
        income += t.amount;
      } else if (t.type === "expense") {
        expense += t.amount;
      }
    }

    return { income, expense: -expense, result: income - expense };
  },
};
