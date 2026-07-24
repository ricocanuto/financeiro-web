import mongoose from "mongoose";

export async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("[db] MongoDB conectado com sucesso");
  } catch (error) {
    console.error("[db] Falha ao conectar no MongoDB:", error.message);
    process.exit(1);
  }
}
