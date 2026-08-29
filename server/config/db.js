import mongoose from "mongoose";

export async function connectDB() {
  mongoose.set("bufferCommands", false);

  if (!process.env.MONGO_URI) {
    console.warn("[db] MONGO_URI não informada — operando com armazenamento em memória temporário");
    return;
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log("[db] MongoDB conectado com sucesso");
  } catch (error) {
    console.warn("[db] Falha ao conectar no MongoDB — operando com armazenamento em memória temporário:", error.message);
  }
}

