"use server";
import Groq from "groq-sdk";
import { RespuestaIA } from "@/types/game";

const groq = new Groq({ 
  apiKey: process.env.GROQ_API_KEY_NARRADOR 
});

/**
 * Genera la narrativa y opciones del juego utilizando el Agente Narrador.
 */
export async function generarNarrativa(contextoActual: string): Promise<RespuestaIA> {
  if (!process.env.GROQ_API_KEY_NARRADOR) {
    throw new Error("GROQ_API_KEY_NARRADOR no está configurada");
  }

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `Eres el Game Master de "Codeverso History". Tu única tarea es narrar la historia y ofrecer opciones lógicas.
          REGLAS ESTRICTAS:
          1. Solo respondes en JSON.
          2. No puedes inventar atributos fuera de: fuerza, agilidad, inteligencia.
          3. Las opciones deben ser coherentes con el entorno.
          4. La narrativa debe ser inmersiva y descriptiva.
          
          ESTRUCTURA JSON:
          {
            "narrativa": "...",
            "opciones": [
              {
                "id": 1,
                "texto_boton": "...",
                "tipo_accion": "narrativa|combate|dialogo|movimiento",
                "atributo_requerido": "fuerza|agilidad|inteligencia" (opcional)
              }
            ]
          }`
        },
        {
          role: "user",
          content: contextoActual
        }
      ],
      model: "llama-3.3-versatile",
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0].message.content;
    if (!content) throw new Error("La IA devolvió una respuesta vacía");

    return JSON.parse(content) as RespuestaIA;
  } catch (error) {
    console.error("Error al generar narrativa:", error);
    throw new Error("Error en la comunicación con el Agente Narrador");
  }
}
