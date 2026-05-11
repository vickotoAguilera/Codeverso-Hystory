"use server";
import Groq from "groq-sdk";

const groq = new Groq({ 
  apiKey: process.env.GROQ_API_KEY_COMBATE 
});

interface ResultadoCombate {
  exito: boolean;
  tirada: number;
  atributo: number;
  defensaEnemigo: number;
  total: number;
  danio: number;
}

/**
 * Procesa la lógica de combate en el servidor y genera una narración.
 */
export async function procesarCombate(
  atributoValor: number, 
  nombreAtributo: string,
  defensaEnemigo: number = 10
) {
  // 1. Tirada de dados (D20)
  const tirada = Math.floor(Math.random() * 20) + 1;
  const total = tirada + atributoValor;
  const exito = total >= defensaEnemigo;
  const danio = exito ? Math.max(1, total - defensaEnemigo) : 0;

  const resultado: ResultadoCombate = {
    exito,
    tirada,
    atributo: atributoValor,
    defensaEnemigo,
    total,
    danio
  };

  // 2. Llamada al Agente de Combate para narrar
  try {
    const prompt = `Resultado matemático del combate: ${exito ? 'ÉXITO' : 'FALLO'}. 
    Detalles: Tirada ${tirada} + ${nombreAtributo} (${atributoValor}) = Total ${total} vs Defensa ${defensaEnemigo}. 
    Daño causado: ${danio}.
    Narra este impacto de forma épica y breve.`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "Eres el Agente de Combate de Codeverso History. Tu tarea es recibir resultados matemáticos y convertirlos en narraciones épicas y cortas. No menciones los números exactos a menos que sea necesario para el drama."
        },
        { role: "user", content: prompt }
      ],
      model: "llama-3.3-versatile",
    });

    return {
      narracion: completion.choices[0].message.content,
      resultado
    };
  } catch (error) {
    console.error("Error en Agente de Combate:", error);
    return {
      narracion: exito ? "Logras impactar al enemigo con fuerza." : "Tu ataque falla por poco.",
      resultado
    };
  }
}
