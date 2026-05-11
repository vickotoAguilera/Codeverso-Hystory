"use server";
import Groq from "groq-sdk";
import { Genero } from "@/types/game";

const groq = new Groq({ 
  apiKey: process.env.GROQ_API_KEY_WIZARD 
});

/**
 * Sugiere nombres para el personaje basados en su raza y género.
 */
export async function sugerirNombres(genero: Genero, raza: string): Promise<string[]> {
  try {
    const prompt = `Genera exactamente 3 nombres cortos y épicos para un personaje de RPG.
    Raza: ${raza}.
    Género: ${genero}.
    Tono: Oscuro, medieval.
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

/**
 * Sugiere nombres/títulos para el Némesis del jugador.
 */
export async function sugerirNemesis(trasfondo: string): Promise<string[]> {
  try {
    const prompt = `Basado en este trasfondo: "${trasfondo}", genera 3 nombres o títulos de un villano final que causó la ruina del jugador.
    Tono: Aterrador, imponente, sombrío.
    Ejemplo: "Malphas el Devorador de Almas".
    Responde ÚNICAMENTE con los 3 nombres separados por comas.`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "Eres un creador de villanos legendarios para historias de fantasía oscura."
        },
        { role: "user", content: prompt }
      ],
      model: "llama-3.3-versatile",
    });

    const content = completion.choices[0].message.content;
    if (!content) return ["El Rey de las Sombras", "Malphas", "La Tejedora de Plagas"];

    return content.split(",").map(n => n.trim());
  } catch (error) {
    console.error("Error al sugerir némesis:", error);
    return ["El Rey de las Sombras", "Malphas", "La Tejedora de Plagas"];
  }
}

/**
 * Genera trasfondos adicionales utilizando IA.
 */
export async function generarTrasfondosIA(): Promise<{ nombre: string; lore: string }[]> {
  try {
    const prompt = `Genera 3 trasfondos trágicos y oscuros para un RPG de fantasía. 
    Devuelve SOLO un JSON con un objeto que contenga un array 'trasfondos_extra', cada uno con 'nombre' y 'lore' (máx 20 palabras).`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "Eres un narrador de historias trágicas y oscuras. Responde exclusivamente en formato JSON."
        },
        { role: "user", content: prompt }
      ],
      model: "llama-3.3-versatile",
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0].message.content;
    if (!content) return [];

    const data = JSON.parse(content);
    return data.trasfondos_extra || [];
  } catch (error) {
    console.error("Error al generar trasfondos IA:", error);
    return [];
  }
}
