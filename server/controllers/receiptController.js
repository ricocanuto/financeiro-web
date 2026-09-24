import Account from "../models/Account.js";
import Category from "../models/Category.js";
import { extractReceiptDataFromText } from "../services/geminiService.js";

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

// Reduz o HTML da página da NFC-e a texto simples, cortando um tamanho
// razoável — o Gemini não precisa da página inteira, só do conteúdo visível.
function htmlToPlainText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 6000);
}

// Um QR Code de NFC-e brasileira aponta pra uma URL da Sefaz do estado
// emissor. Se o conteúdo escaneado for essa URL, buscamos a página real;
// caso contrário (QR de outro tipo), usamos o texto bruto como fallback.
async function resolveReceiptText(qrText) {
  const looksLikeUrl = /^https?:\/\//i.test(qrText.trim());
  if (!looksLikeUrl) {
    return qrText;
  }

  const response = await fetch(qrText.trim(), {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; FinanceiroWeb/1.0)" },
  });

  if (!response.ok) {
    throw new Error(`Não foi possível abrir a página da nota fiscal (status ${response.status})`);
  }

  const html = await response.text();
  return htmlToPlainText(html);
}

export async function extractReceipt(req, res) {
  const { qrText } = req.body;

  if (!qrText || typeof qrText !== "string" || !qrText.trim()) {
    return res.status(400).json({ message: "Conteúdo do QR Code não informado" });
  }

  try {
    const receiptText = await resolveReceiptText(qrText);
    const extracted = await extractReceiptDataFromText(receiptText);

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
    console.error("[receipts] erro ao extrair nota via QR Code:", error.message);
    res.status(502).json({
      message: "Não foi possível ler os dados da nota a partir do QR Code. Tente novamente ou preencha manualmente.",
    });
  }
}
