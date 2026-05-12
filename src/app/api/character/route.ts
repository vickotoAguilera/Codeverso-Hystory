import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

let _groq: Groq | null = null;
function getGroq() {
  if (!_groq) _groq = new Groq({ apiKey: process.env.GROQ_API_KEY_WIZARD || process.env.GROQ_API_KEY_NARRADOR });
  return _groq;
}

export async function POST(req: NextRequest) {
  try {
    const { action, ...params } = await req.json();

    if (action === "sugerirNombres") {
      const { genero, raza } = params;
      const prompt = `Genera exactamente 3 nombres cortos y épicos para un personaje de RPG.
      Raza: ${raza}.
      Género: ${genero}.
      Tono: Oscuro, medieval.
      Responde ÚNICAMENTE con los 3 nombres separados por comas, sin explicaciones ni números.`;

      const completion = await getGroq().chat.completions.create({
        messages: [
          { role: "system", content: "Eres un experto en onomástica fantástica para juegos de rol oscuros." },
          { role: "user", content: prompt }
        ],
        model: "llama-3.3-versatile",
      });

      const content = completion.choices[0].message.content;
      if (!content) return NextResponse.json(["Eldrin", "Thalindra", "Kaelen"]);
      return NextResponse.json(content.split(",").map((n: string) => n.trim()));
    }

    if (action === "sugerirNemesis") {
      const { trasfondo } = params;
      const prompt = `Basado en este trasfondo: "${trasfondo}", genera 3 nombres o títulos de un villano final que causó la ruina del jugador.
      Tono: Aterrador, imponente, sombrío.
      Ejemplo: "Malphas el Devorador de Almas".
      Responde ÚNICAMENTE con los 3 nombres separados por comas.`;

      const completion = await getGroq().chat.completions.create({
        messages: [
          { role: "system", content: "Eres un creador de villanos legendarios para historias de fantasía oscura." },
          { role: "user", content: prompt }
        ],
        model: "llama-3.3-versatile",
      });

      const content = completion.choices[0].message.content;
      if (!content) return NextResponse.json(["El Rey de las Sombras", "Malphas", "La Tejedora de Plagas"]);
      return NextResponse.json(content.split(",").map((n: string) => n.trim()));
    }

    if (action === "generarTrasfondosIA") {
      const prompt = `Genera 3 trasfondos trágicos y oscuros para un RPG de fantasía. 
      Devuelve SOLO un JSON con un objeto que contenga un array 'trasfondos_extra', cada uno con 'nombre' y 'lore' (máx 20 palabras).`;

      const completion = await getGroq().chat.completions.create({
        messages: [
          { role: "system", content: "Eres un narrador de historias trágicas y oscuras. Responde exclusivamente en formato JSON." },
          { role: "user", content: prompt }
        ],
        model: "llama-3.3-versatile",
        response_format: { type: "json_object" }
      });

      const content = completion.choices[0].message.content;
      if (!content) return NextResponse.json([]);
      const data = JSON.parse(content);
      return NextResponse.json(data.trasfondos_extra || []);
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("Error in character API:", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
