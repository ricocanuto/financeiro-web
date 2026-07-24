import Transaction from "../models/Transaction.js";

export async function listTransactions(req, res) {
  const { from, to, accountId, categoryId, type } = req.query;
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

  res.status(201).json(transaction);
}

export async function updateTransaction(req, res) {
  const transaction = await Transaction.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    req.body,
    { new: true }
  );

  if (!transaction) {
    return res.status(404).json({ message: "Lançamento não encontrado" });
  }

  res.json(transaction);
}

export async function deleteTransaction(req, res) {
  const transaction = await Transaction.findOneAndDelete({
    _id: req.params.id,
    userId: req.userId,
  });

  if (!transaction) {
    return res.status(404).json({ message: "Lançamento não encontrado" });
  }

  res.status(204).send();
}