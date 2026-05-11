"use server";
import Groq from "groq-sdk";
import { Genero } from "@/types/game";

const groq = new Groq({ 
  apiKey: process.env.GROQ_API_KEY_NARRADOR 
});

/**
 * Sugiere nombres para el personaje basados en su género y el tono del juego.
 */
export async function sugerirNombres(genero: Genero): Promise<string[]> {
  try {
    const prompt = `Genera exactamente 3 nombres para un personaje de RPG.
    Género: ${genero}.
    Tono: Oscuro, medieval, épico, misterioso.
    Responde ÚNICAMENTE con los 3 nombres separados por comas, sin explicaciones ni números.`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "Eres un experto en onomástica fantástica para juegos de rol oscuros."
        },
        { role: "user", content: prompt }
      ],
      model: "llama-3.3-versatile",
    });

    const content = completion.choices[0].message.content;
    if (!content) return ["Eldrin", "Thalindra", "Kaelen"];

    return content.split(",").map(n => n.trim());
  } catch (error) {
    console.error("Error al sugerir nombres:", error);
    return ["Eldrin", "Thalindra", "Kaelen"];
  }
}
