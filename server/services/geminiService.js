import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function extractReceiptData(imageBuffer, mimeType) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
    Analise esta imagem de comprovante/nota fiscal e extraia os seguintes dados em formato JSON puro:
    - description: breve descrição do estabelecimento ou item principal
    - amount: valor total como número (ex: 45.90)
    - date: data no formato YYYY-MM-DD (se não houver, use a data de hoje)
    - category: uma sugestão simples de categoria (ex: Alimentação, Transporte, Saúde, Mercado, Lazer, Outros)

    Responda EXCLUSIVAMENTE com o JSON válido, sem formatação markdown ou textos adicionais.
  `;

  const imagePart = {
    inlineData: {
      data: imageBuffer.toString("base64"),
      mimeType,
    },
  };

  const result = await model.generateContent([prompt, imagePart]);
  const responseText = result.response.text().trim();
  
  // Limpa possíveis marcações de código markdown do JSON se o modelo retornar
  const cleanedJson = responseText.replace(/```json|```/g, "").trim();

  return JSON.parse(cleanedJson);
}