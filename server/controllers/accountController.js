import Account from "../models/Account.js";

export async function listAccounts(req, res) {
  const accounts = await Account.find({ userId: req.userId }).sort({
    createdAt: 1,
  });
  res.json(accounts);
}

export async function createAccount(req, res) {
  const { name, icon, color, initialBalance, includeInTotal } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Nome da conta é obrigatório" });
  }

  const account = await Account.create({
    userId: req.userId,
    name,
    icon,
    color,
    initialBalance,
    includeInTotal,
  });

  res.status(201).json(account);
}

export async function updateAccount(req, res) {
  const account = await Account.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    req.body,
    { new: true }
  );

  if (!account) {
    return res.status(404).json({ message: "Conta não encontrada" });
  }

  res.json(account);
}

export async function deleteAccount(req, res) {
  const account = await Account.findOneAndDelete({
    _id: req.params.id,
    userId: req.userId,
  });

  if (!account) {
    return res.status(404).json({ message: "Conta não encontrada" });
  }

  res.status(204).send();
}
