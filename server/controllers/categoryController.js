import Category from "../models/Category.js";

export async function listCategories(req, res) {
  const { type } = req.query;
  const filter = { userId: req.userId };
  if (type) filter.type = type;

  const categories = await Category.find(filter).sort({ name: 1 });
  res.json(categories);
}

export async function createCategory(req, res) {
  const { name, type, color, monthlyGoal } = req.body;

  if (!name || !type) {
    return res
      .status(400)
      .json({ message: "Nome e tipo da categoria são obrigatórios" });
  }

  const category = await Category.create({
    userId: req.userId,
    name,
    type,
    color,
    monthlyGoal,
  });

  res.status(201).json(category);
}

export async function updateCategory(req, res) {
  const category = await Category.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    req.body,
    { new: true }
  );

  if (!category) {
    return res.status(404).json({ message: "Categoria não encontrada" });
  }

  res.json(category);
}

export async function deleteCategory(req, res) {
  const category = await Category.findOneAndDelete({
    _id: req.params.id,
    userId: req.userId,
  });

  if (!category) {
    return res.status(404).json({ message: "Categoria não encontrada" });
  }

  res.status(204).send();
}
