import sharp from "sharp";
import Account from "../models/Account.js";
import Category from "../models/Category.js";
import { extractReceiptData } from "../services/geminiService.js";

function normalize(str) {
  return (str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

// Tenta casar o nome sugerido pela IA com uma categoria já cadastrada pelo
// usuário (match exato normalizado, depois "contém"). Se nada bater,
// devolve null e o front deixa o campo em branco para o usuário escolher.
function matchCategory(categories, suggestedName, type) {
  if (!suggestedName) return null;
  const target = normalize(suggestedName);
  const candidates = categories.filter((c) => c.type === type);

  const exact = candidates.find((c) => normalize(c.name) === target);
  if (exact) return exact;

  const partial = candidates.find(
    (c) => normalize(c.name).includes(target) || target.includes(normalize(c.name))
  );
  return partial || null;
}

export async function extractReceipt(req, res) {
  if (!req.file) {
    return res.status(400).json({ message: "Nenhuma imagem enviada" });
  }

  try {
    // Comprime/redimensiona para economizar tokens e acelerar o upload
    const compressedBuffer = await sharp(req.file.buffer)
      .resize({ width: 1280, withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer();

    const extracted = await extractReceiptData(compressedBuffer, "image/jpeg");

    const [categories, accounts] = await Promise.all([
      Category.find({ userId: req.userId }),
      Account.find({ userId: req.userId }),
    ]);

    const matchedCategory = matchCategory(
      categories,
      extracted.suggestedCategory,
      extracted.type || "expense"
    );

    res.json({
      description: extracted.description || extracted.merchant || "",
      amount: extracted.total ?? null,
      date: extracted.date || new Date().toISOString().slice(0, 10),
      type: extracted.type === "income" ? "income" : "expense",
      suggestedCategoryName: extracted.suggestedCategory || null,
      categoryId: matchedCategory?._id || null,
      // Se só existir uma conta cadastrada, já sugere ela; senão o usuário escolhe
      accountId: accounts.length === 1 ? accounts[0]._id : null,
    });
  } catch (error) {
    console.error("[receipts] erro ao extrair comprovante:", error.message);
    res.status(502).json({
      message: "Não foi possível ler o comprovante automaticamente. Tente novamente ou preencha manualmente.",
    });
  }
}
