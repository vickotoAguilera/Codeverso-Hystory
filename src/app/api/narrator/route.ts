import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { RespuestaIA, Personaje, Companero, FaseJuego } from "@/types/game";

let _groq: Groq | null = null;
function getGroq() {
  if (!_groq) _groq = new Groq({ apiKey: process.env.GROQ_API_KEY_NARRADOR });
  return _groq;
}

export async function POST(req: NextRequest) {
  try {
    const { contextoActual, personaje, fase, grupo = [] } = await req.json() as {
      contextoActual: string;
      personaje: Personaje;
      fase: FaseJuego;
      grupo: Companero[];
    };

    if (!process.env.GROQ_API_KEY_NARRADOR) {
      return NextResponse.json({ error: "GROQ_API_KEY_NARRADOR no está configurada" }, { status: 500 });
    }

    const grupoInfo = grupo.length > 0 
      ? grupo.map(c => `${c.nombre} (${c.clase})`).join(", ") 
      : "viaja solo";

    const completion = await getGroq().chat.completions.create({
      messages: [
        {
          role: "system",
          content: `Eres el Game Master de "Codeverso History". Tu única tarea es narrar la historia y ofrecer opciones lógicas.
          
          CONTEXTO DEL JUGADOR:
          - Nombre: ${personaje.nombre}
          - Género: ${personaje.genero}
          - Raza: ${personaje.raza}
          - Clase: ${personaje.clase}
          - Trasfondo: ${personaje.trasfondo}
          - Némesis: ${personaje.nemesis}
          - Rasgos Físicos/Estética: ${personaje.narrative_context || "No definidos"}
          - Grupo: ${grupoInfo}
          - Fase Actual: ${fase}

          REGLA DE OBJETOS ESPECIALES:
          - Si el jugador posee el "Collar de Telepatía" en su contexto o inventario, DEBES incluir ocasionalmente una opción de tipo "dialogo" o "narrativa" que permita "Leer la mente" de los NPCs para obtener información oculta o ventajas.

          REGLA DE FASE (CRÍTICO):
          - Si la fase es 'prologo': DEBES narrar una batalla épica, abrumadora e imposible de ganar contra su Némesis (${personaje.nemesis}). El jugador DEBE perder sus recuerdos al final de este combate y despertar confundido frente al Gremio de Aventureros en nivel 1.
          - Si la fase es 'aventura': Usa el trasfondo y al Némesis solo como visiones, recuerdos fragmentados o motivaciones lejanas.

          REGLAS ESTRICTAS:
          1. Solo respondes en JSON.
          2. Adapta estrictamente los pronombres en la narración al género del personaje (${personaje.genero}).
          3. Cuando narres combates, describe cómo los compañeros (${grupoInfo}) interactúan de forma autónoma según sus clases.
          4. No puedes inventar atributos fuera de: fuerza, agilidad, inteligencia.
          5. Las opciones deben ser coherentes con el entorno.
          6. La narrativa debe ser inmersiva y descriptiva.
          
          ESTRUCTURA JSON:
          {
            "narrativa": "...",
            "bgm_change": "world_map|woodland|town|forest_nymph|cave_hell|song_18|fomorians_rise|moralltach|market|ireland_coast|heroic_demise|tropical_island|sneaking|prairie_nights|thael_mines|military_base|tuatha_exodus|whispers_beyond|witch_lair|apocalypse|catacombs|ancient_evil|celtic_raiders|celtic_warrior|cu_chullain|battle_rpg|children_of_lir|cave_theme|innocence|summer_memories|sand_castles|peaceful_days|childhood_friends|home_place|caketown|battle_a|awesomeness|prep_battle|army_approach|encounter_witches|irish_souls|prayer_fields" (opcional, solo si la escena cambia de tono o lugar),
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
    if (!content) return NextResponse.json({ error: "La IA devolvió una respuesta vacía" }, { status: 500 });

    return NextResponse.json(JSON.parse(content) as RespuestaIA);
  } catch (error) {
    console.error("Error al generar narrativa:", error);
    return NextResponse.json({ error: "Error en la comunicación con el Agente Narrador" }, { status: 500 });
  }
}
