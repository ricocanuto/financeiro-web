import mongoose from "mongoose";
import Category from "../models/Category.js";
import { inMemoryStore } from "../services/inMemoryStore.js";

function isDbConnected() {
  return mongoose.connection && mongoose.connection.readyState === 1;
}

export async function listCategories(req, res) {
  const { type } = req.query;
  try {
    if (isDbConnected()) {
      const filter = { userId: req.userId };
      if (type) filter.type = type;

      const categories = await Category.find(filter).sort({ name: 1 });
      return res.json(categories);
    }
  } catch (err) {
    console.warn("[categories] Erro no banco de dados, usando fallback:", err.message);
  }

  const categories = inMemoryStore.listCategories(req.userId, type);
  res.json(categories);
}

export async function createCategory(req, res) {
  const { name, type, color, monthlyGoal } = req.body;

  if (!name || !type) {
    return res
      .status(400)
      .json({ message: "Nome e tipo da categoria são obrigatórios" });
  }

  try {
    if (isDbConnected()) {
      const category = await Category.create({
        userId: req.userId,
        name,
        type,
        color,
        monthlyGoal,
      });
      return res.status(201).json(category);
    }
  } catch (err) {
    console.warn("[categories] Erro no banco de dados, usando fallback:", err.message);
  }

  const category = inMemoryStore.createCategory(req.userId, {
    name,
    type,
    color,
    monthlyGoal,
  });
  res.status(201).json(category);
}

export async function updateCategory(req, res) {
  try {
    if (isDbConnected()) {
      const category = await Category.findOneAndUpdate(
        { _id: req.params.id, userId: req.userId },
        req.body,
        { new: true }
      );

      if (!category) {
        return res.status(404).json({ message: "Categoria não encontrada" });
      }

      return res.json(category);
    }
  } catch (err) {
    console.warn("[categories] Erro no banco de dados, usando fallback:", err.message);
  }

  const category = inMemoryStore.updateCategory(req.userId, req.params.id, req.body);
  if (!category) {
    return res.status(404).json({ message: "Categoria não encontrada" });
  }
  res.json(category);
}

export async function deleteCategory(req, res) {
  try {
    if (isDbConnected()) {
      const category = await Category.findOneAndDelete({
        _id: req.params.id,
        userId: req.userId,
      });

      if (!category) {
        return res.status(404).json({ message: "Categoria não encontrada" });
      }

      return res.status(204).send();
    }
  } catch (err) {
    console.warn("[categories] Erro no banco de dados, usando fallback:", err.message);
  }

  const deleted = inMemoryStore.deleteCategory(req.userId, req.params.id);
  if (!deleted) {
    return res.status(404).json({ message: "Categoria não encontrada" });
  }
  res.status(204).send();
}

