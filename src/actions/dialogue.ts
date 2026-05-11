"use server";

import Groq from "groq-sdk";
import { Personaje, Companero } from "@/types/game";

const groq = new Groq({ 
  apiKey: process.env.GROQ_API_KEY_DIALOGUE 
});

interface DialogueResponse {
  dialogo: string;
  opciones_respuesta: {
    id: number;
    texto: string;
    tipo: "narrativa" | "accion";
  }[];
}

/**
 * Agente de Diálogo: Gestiona conversaciones con NPCs y compañeros.
 */
export async function hablarConNPC(
  mensajeUsuario: string,
  personaje: Personaje,
  grupo: Companero[],
  contextoNPC: string
): Promise<DialogueResponse> {
  const grupoInfo = grupo.length > 0 
    ? grupo.map(c => `${c.nombre} (${c.clase}, Actitud: ${c.actitud || 'Neutral'})`).join(", ") 
    : "viaja solo";

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `Eres el Agente de Diálogo de Codeverso History. Estás interpretando a los NPCs del mundo.
          
          CONTEXTO DEL JUGADOR:
          - Nombre: ${personaje.nombre}
          - Clase: ${personaje.clase}
          - Grupo: ${grupoInfo}
          
          NPC ACTUAL: ${contextoNPC}

          REGLAS:
          1. Responde exclusivamente con diálogos y expresiones del NPC o compañeros.
          2. Mantén el tono oscuro y épico.
          3. Devuelve SOLO un JSON con la estructura:
          {
            "dialogo": "Texto del diálogo...",
            "opciones_respuesta": [
              {"id": 1, "texto": "Respuesta corta...", "tipo": "narrativa|accion"}
            ]
          }`
        },
        { role: "user", content: mensajeUsuario }
      ],
      model: "llama-3.3-versatile",
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0].message.content;
    return JSON.parse(content || '{}') as DialogueResponse;
  } catch (error) {
    console.error("Error en Agente de Diálogo:", error);
    return {
      dialogo: "El silencio se apodera del lugar.",
      opciones_respuesta: [{ id: 1, texto: "Continuar...", tipo: "narrativa" }]
    };
  }
}
