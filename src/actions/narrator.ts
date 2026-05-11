"use server";
import Groq from "groq-sdk";
import { RespuestaIA, Personaje, Companero } from "@/types/game";

const groq = new Groq({ 
  apiKey: process.env.GROQ_API_KEY_NARRADOR 
});

/**
 * Genera la narrativa y opciones del juego utilizando el Agente Narrador.
 */
export async function generarNarrativa(
  contextoActual: string, 
  personaje: Personaje, 
  grupo: Companero[] = []
): Promise<RespuestaIA> {
  if (!process.env.GROQ_API_KEY_NARRADOR) {
    throw new Error("GROQ_API_KEY_NARRADOR no está configurada");
  }

  const grupoInfo = grupo.length > 0 
    ? grupo.map(c => `${c.nombre} (${c.clase})`).join(", ") 
    : "viaja solo";

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `Eres el Game Master de "Codeverso History". Tu única tarea es narrar la historia y ofrecer opciones lógicas.
          
          CONTEXTO DEL JUGADOR:
          - Nombre: ${personaje.nombre}
          - Género: ${personaje.genero}
          - Grupo: ${grupoInfo}

          REGLAS ESTRICTAS:
          1. Solo respondes en JSON.
          2. Adapta estrictamente los pronombres en la narración al género del personaje (${personaje.genero}).
          3. Cuando narres combates, describe cómo los compañeros (${grupoInfo}) interactúan de forma autónoma según sus clases (ej. El tanque bloquea, el soporte cura).
          4. No puedes inventar atributos fuera de: fuerza, agilidad, inteligencia.
          5. Las opciones deben ser coherentes con el entorno.
          6. La narrativa debe ser inmersiva y descriptiva.
          
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
