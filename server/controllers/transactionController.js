import mongoose from "mongoose";
import Transaction from "../models/Transaction.js";
import { inMemoryStore } from "../services/inMemoryStore.js";

function isDbConnected() {
  return mongoose.connection && mongoose.connection.readyState === 1;
}

export async function listTransactions(req, res) {
  const { from, to, accountId, categoryId, type } = req.query;

  try {
    if (isDbConnected()) {
      const filter = { userId: req.userId };

      if (from || to) {
        filter.date = {};
        if (from) filter.date.$gte = new Date(from);
        if (to) filter.date.$lte = new Date(to);
      }
      if (accountId) filter.accountId = accountId;
      if (categoryId) filter.categoryId = categoryId;
      if (type) filter.type = type;

      const transactions = await Transaction.find(filter)
        .populate("accountId", "name color icon")
        .populate("categoryId", "name color type")
        .sort({ date: -1 });

      return res.json(transactions);
    }
  } catch (err) {
    console.warn("[transactions] Erro no banco de dados, usando fallback:", err.message);
  }

  const transactions = inMemoryStore.listTransactions(req.userId, {
    from,
    to,
    accountId,
    categoryId,
    type,
  });
  res.json(transactions);
}

export async function createTransaction(req, res) {
  const { accountId, categoryId, type, description, amount, date, confirmed } =
    req.body;

  if (!accountId || !categoryId || !type || !description || !amount || !date) {
    return res
      .status(400)
      .json({ message: "Preencha todos os campos obrigatórios" });
  }

  try {
    if (isDbConnected()) {
      const transaction = await Transaction.create({
        userId: req.userId,
        accountId,
        categoryId,
        type,
        description,
        amount,
        date,
        confirmed,
      });

      const populated = await Transaction.findById(transaction._id)
        .populate("accountId", "name color icon")
        .populate("categoryId", "name color type");

      return res.status(201).json(populated || transaction);
    }
  } catch (err) {
    console.warn("[transactions] Erro no banco de dados, usando fallback:", err.message);
  }

  const transaction = inMemoryStore.createTransaction(req.userId, {
    accountId,
    categoryId,
    type,
    description,
    amount,
    date,
    confirmed,
  });
  res.status(201).json(transaction);
}

export async function updateTransaction(req, res) {
  try {
    if (isDbConnected()) {
      const transaction = await Transaction.findOneAndUpdate(
        { _id: req.params.id, userId: req.userId },
        req.body,
        { new: true }
      )
        .populate("accountId", "name color icon")
        .populate("categoryId", "name color type");

      if (!transaction) {
        return res.status(404).json({ message: "Lançamento não encontrado" });
      }

      return res.json(transaction);
    }
  } catch (err) {
    console.warn("[transactions] Erro no banco de dados, usando fallback:", err.message);
  }

  const transaction = inMemoryStore.updateTransaction(req.userId, req.params.id, req.body);
  if (!transaction) {
    return res.status(404).json({ message: "Lançamento não encontrado" });
  }
  res.json(transaction);
}

export async function deleteTransaction(req, res) {
  try {
    if (isDbConnected()) {
      const transaction = await Transaction.findOneAndDelete({
        _id: req.params.id,
        userId: req.userId,
      });

      if (!transaction) {
        return res.status(404).json({ message: "Lançamento não encontrado" });
      }

      return res.status(204).send();
    }
  } catch (err) {
    console.warn("[transactions] Erro no banco de dados, usando fallback:", err.message);
  }

  const deleted = inMemoryStore.deleteTransaction(req.userId, req.params.id);
  if (!deleted) {
    return res.status(404).json({ message: "Lançamento não encontrado" });
  }
  res.status(204).send();
}
