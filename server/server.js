import cors from "cors";
import "dotenv/config";
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./config/db.js";

import accountRoutes from "./routes/accountRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import receiptRoutes from "./routes/receiptRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

// API health endpoint
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

// API routes
app.use("/api/accounts", accountRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/receipts", receiptRoutes);

// Servir frontend compilado (client/dist)
const clientDistPath = path.resolve(__dirname, "../client/dist");
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get("*", (req, res) => {
    if (!req.path.startsWith("/api")) {
      res.sendFile(path.join(clientDistPath, "index.html"));
    }
  });
}

// Error middleware fallback
app.use((err, req, res, _next) => {
  if (
    err.name === "MongooseError" ||
    err.name === "MongoNetworkError" ||
    err.message?.includes("buffering timed out")
  ) {
    console.warn("[server] Banco de dados indisponível — respondendo com fallback");
    if (req.method === "GET") {
      return res.json(req.path.endsWith("s") || req.path.endsWith("s/") ? [] : {});
    }
    return res.status(503).json({ error: "Serviço temporariamente indisponível" });
  }

  console.error("[server] erro não tratado:", err);
  res.status(500).json({ message: "Erro interno do servidor" });
});

const PORT = 3000;

connectDB().then(() => {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[server] rodando em http://0.0.0.0:${PORT}`);
  });
});

