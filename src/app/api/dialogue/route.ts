export const runtime = 'edge';
import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { Personaje, Companero } from "@/types/game";

let _groq: Groq | null = null;
function getGroq() {
  if (!_groq) _groq = new Groq({ apiKey: process.env.GROQ_API_KEY_DIALOGO });
  return _groq;
}

interface DialogueResponse {
  dialogo: string;
  opciones_respuesta: {
    id: number;
    texto: string;
    tipo: "narrativa" | "accion";
  }[];
}

export async function POST(req: NextRequest) {
  try {
    const { mensajeUsuario, personaje, grupo, contextoNPC } = await req.json() as {
      mensajeUsuario: string;
      personaje: Personaje;
      grupo: Companero[];
      contextoNPC: string;
    };

    const grupoInfo = grupo.length > 0 
      ? grupo.map((c: Companero) => `${c.nombre} (${c.clase}, Actitud: ${c.actitud || 'Neutral'})`).join(", ") 
      : "viaja solo";

    const completion = await getGroq().chat.completions.create({
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
    return NextResponse.json(JSON.parse(content || '{}') as DialogueResponse);
  } catch (error) {
    console.error("Error en Agente de Diálogo:", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
