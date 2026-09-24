import { GoogleGenAI } from "@google/genai";

const EXTRACTION_PROMPT = `
Você recebe o texto extraído da página oficial de uma nota fiscal eletrônica
brasileira (NFC-e), obtida a partir do QR Code impresso no cupom. Extraia os
dados e responda APENAS com um JSON válido, sem markdown, sem texto antes ou
depois, no seguinte formato exato:

{
  "merchant": "nome do estabelecimento emissor, string ou null",
  "date": "data de emissão no formato YYYY-MM-DD, ou null se não encontrada",
  "total": "valor total da nota como número (ex: 45.9), ou null se não encontrado",
  "type": "expense" ou "income" (assuma expense — é sempre uma compra),
  "suggestedCategory": "uma categoria curta em português, ex: Alimentação, Transporte, Moradia, Saúde, Lazer, Mercado",
  "description": "descrição curta e objetiva, ex: 'Compras - Supermercado X'"
}

Se o texto não parecer ser de uma nota fiscal válida, responda com todos os
campos null exceto "type": "expense".
`.trim();

/**
 * Envia o texto extraído da página da NFC-e (resolvida a partir do QR Code)
 * para o Gemini e retorna os campos já estruturados.
 */
export async function extractReceiptDataFromText(rawText) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY não configurada no .env do servidor");
  }

  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [{ text: `${EXTRACTION_PROMPT}\n\n--- TEXTO DA NOTA ---\n${rawText}` }],
      },
    ],
  });

  const responseText = (response.text || "").trim();
  const cleanedJson = responseText.replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(cleanedJson);
  } catch {
    throw new Error("Não foi possível interpretar o JSON retornado pelo Gemini");
  }
}
