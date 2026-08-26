import { GoogleGenAI } from "@google/genai";

export async function extractReceiptData(imageBuffer, mimeType) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    Analise esta imagem de comprovante/nota fiscal e extraia os seguintes dados em formato JSON puro:
    - description: breve descrição do estabelecimento ou item principal
    - amount: valor total como número (ex: 45.90)
    - date: data no formato YYYY-MM-DD (se não houver, use a data de hoje)
    - category: uma sugestão simples de categoria (ex: Alimentação, Transporte, Saúde, Mercado, Lazer, Outros)
    - suggestedCategory: a mesma sugestão de categoria acima
    - total: o mesmo valor total numérico acima
    - type: "expense" ou "income" (padrão: "expense")

    Responda EXCLUSIVAMENTE com o JSON válido, sem formatação markdown ou textos adicionais.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          { text: prompt },
          {
            inlineData: {
              data: imageBuffer.toString("base64"),
              mimeType: mimeType || "image/jpeg",
            },
          },
        ],
      },
    ],
  });

  const responseText = (response.text || "").trim();
  const cleanedJson = responseText.replace(/```json|```/g, "").trim();

  return JSON.parse(cleanedJson);
}
