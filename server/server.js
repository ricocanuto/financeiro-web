import cors from "cors";
import "dotenv/config";
import express from "express";
import { connectDB } from "./config/db.js";

import accountRoutes from "./routes/accountRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import receiptRoutes from "./routes/receiptRoutes.js";

const app = express();

// CORS restrito ao domínio do front-end — nunca deixar aberto (cors() sem
// opções aceita qualquer origem, o que é perigoso numa API que lida com
// dados financeiros pessoais).
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/accounts", accountRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/receipts", receiptRoutes);

// Handler de erro genérico — sempre reporta a falha real, nunca mascara
// com uma resposta vazia/fake que esconderia um problema de infraestrutura.
app.use((err, req, res, next) => {
  console.error("[server] erro não tratado:", err);
  res.status(500).json({ message: "Erro interno do servidor" });
});

const PORT = process.env.PORT || 4000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`[server] rodando em http://localhost:${PORT}`);
  });
});
