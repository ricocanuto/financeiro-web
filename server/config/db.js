import mongoose from "mongoose";

export async function connectDB() {
  if (!process.env.MONGO_URI) {
    throw new Error(
      "[db] MONGO_URI não informada. O servidor não inicia sem um banco de dados real " +
      "— um app financeiro nunca deve rodar silenciosamente com armazenamento temporário."
    );
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("[db] MongoDB conectado com sucesso");
  } catch (error) {
    console.error("[db] Falha ao conectar no MongoDB:", error.message);
    // Encerra o processo em vez de continuar "no ar" sem persistência real.
    // O Render reinicia o serviço automaticamente e tenta de novo.
    process.exit(1);
  }
}
