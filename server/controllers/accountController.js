import mongoose from "mongoose";
import Account from "../models/Account.js";
import { inMemoryStore } from "../services/inMemoryStore.js";

function isDbConnected() {
  return mongoose.connection && mongoose.connection.readyState === 1;
}

export async function listAccounts(req, res) {
  try {
    if (isDbConnected()) {
      const accounts = await Account.find({ userId: req.userId }).sort({
        createdAt: 1,
      });
      return res.json(accounts);
    }
  } catch (err) {
    console.warn("[accounts] Erro no banco de dados, usando fallback:", err.message);
  }
  const accounts = inMemoryStore.listAccounts(req.userId);
  res.json(accounts);
}

export async function createAccount(req, res) {
  const { name, icon, color, initialBalance, includeInTotal } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Nome da conta é obrigatório" });
  }

  try {
    if (isDbConnected()) {
      const account = await Account.create({
        userId: req.userId,
        name,
        icon,
        color,
        initialBalance,
        includeInTotal,
      });
      return res.status(201).json(account);
    }
  } catch (err) {
    console.warn("[accounts] Erro no banco de dados, usando fallback:", err.message);
  }

  const account = inMemoryStore.createAccount(req.userId, {
    name,
    icon,
    color,
    initialBalance,
    includeInTotal,
  });
  res.status(201).json(account);
}

export async function updateAccount(req, res) {
  try {
    if (isDbConnected()) {
      const account = await Account.findOneAndUpdate(
        { _id: req.params.id, userId: req.userId },
        req.body,
        { new: true }
      );

      if (!account) {
        return res.status(404).json({ message: "Conta não encontrada" });
      }

      return res.json(account);
    }
  } catch (err) {
    console.warn("[accounts] Erro no banco de dados, usando fallback:", err.message);
  }

  const account = inMemoryStore.updateAccount(req.userId, req.params.id, req.body);
  if (!account) {
    return res.status(404).json({ message: "Conta não encontrada" });
  }
  res.json(account);
}

export async function deleteAccount(req, res) {
  try {
    if (isDbConnected()) {
      const account = await Account.findOneAndDelete({
        _id: req.params.id,
        userId: req.userId,
      });

      if (!account) {
        return res.status(404).json({ message: "Conta não encontrada" });
      }

      return res.status(204).send();
    }
  } catch (err) {
    console.warn("[accounts] Erro no banco de dados, usando fallback:", err.message);
  }

  const deleted = inMemoryStore.deleteAccount(req.userId, req.params.id);
  if (!deleted) {
    return res.status(404).json({ message: "Conta não encontrada" });
  }
  res.status(204).send();
}

