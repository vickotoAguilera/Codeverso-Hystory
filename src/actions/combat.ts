"use server";
import Groq from "groq-sdk";
import { db } from "@/lib/firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { Personaje } from "@/types/game";

const groq = new Groq({ 
  apiKey: process.env.GROQ_API_KEY_COMBATE 
});

interface ResultadoCombate {
  exito: boolean;
  tirada: number;
  atributo: number;
  defensaEnemigo: number;
  total: number;
  danioRecibido: number;
  xpGanada: number;
  subioNivel: boolean;
  muerto: boolean;
}

/**
 * Procesa la lógica de combate en el servidor y aplica cambios en Firestore.
 */
export async function procesarCombate(
  personajeId: string,
  nombreAtributo: string,
  defensaEnemigo: number = 12
) {
  // 1. Obtener datos actuales del personaje
  const charRef = doc(db, "personajes", personajeId);
  const charSnap = await getDoc(charRef);
  
  if (!charSnap.exists()) throw new Error("Personaje no encontrado");
  const character = charSnap.data() as Personaje;

  // 2. Tirada de dados (D20)
  const tirada = Math.floor(Math.random() * 20) + 1;
  const atributoValor = character.atributos[nombreAtributo as keyof typeof character.atributos] || 10;
  const total = tirada + atributoValor;
  const exito = total >= defensaEnemigo;

  let danioRecibido = 0;
  let xpGanada = 0;
  let subioNivel = false;
  let nuevoHP = character.hpActual;
  let nuevaXP = character.experiencia;
  let nuevoNivel = character.nivel;
  let nuevaXPNecesaria = character.xpNecesaria || 100;

  if (exito) {
    // Victoria en el turno
    xpGanada = 25;
    nuevaXP += xpGanada;
    
    // Subida de nivel
    if (nuevaXP >= nuevaXPNecesaria) {
      subioNivel = true;
      nuevoNivel += 1;
      nuevaXP = 0;
      nuevaXPNecesaria = Math.floor(nuevaXPNecesaria * 1.5);
      nuevoHP = character.hpMax; // Curación completa
    }
  } else {
    // Fallo: El jugador recibe daño
    danioRecibido = Math.floor(Math.random() * 5) + 3; // 3-7 de daño
    nuevoHP = Math.max(0, character.hpActual - danioRecibido);
  }

  const muerto = nuevoHP <= 0;

  // 3. Actualizar Firestore
  await updateDoc(charRef, {
    hpActual: nuevoHP,
    experiencia: nuevaXP,
    nivel: nuevoNivel,
    xpNecesaria: nuevaXPNecesaria
  });

  const resultado: ResultadoCombate = {
    exito,
    tirada,
    atributo: atributoValor,
    defensaEnemigo,
    total,
    danioRecibido,
    xpGanada,
    subioNivel,
    muerto
  };

  // 4. Llamada al Agente de Combate para narrar
  try {
    let prompt = "";
    if (muerto) {
      prompt = `El jugador ha sido derrotado y ha muerto en combate contra un enemigo (Defensa ${defensaEnemigo}). Narra sus últimos momentos antes de que todo se vuelva oscuro de forma dramática.`;
    } else if (subioNivel) {
      prompt = `¡Victoria épica! El jugador ha derrotado a su enemigo y ha subido al NIVEL ${nuevoNivel}. Narra cómo su poder aumenta y sus heridas se cierran mágicamente.`;
    } else if (exito) {
      prompt = `Ataque exitoso (Total ${total} vs Defensa ${defensaEnemigo}). El jugador gana ${xpGanada} XP. Narra el impacto y el progreso del héroe.`;
    } else {
      prompt = `El jugador falla su acción (Total ${total} vs Defensa ${defensaEnemigo}) y recibe ${danioRecibido} de daño. Narra el golpe del enemigo y el estado crítico del jugador (HP restante: ${nuevoHP}).`;
    }

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "Eres el Agente de Combate de Codeverso History. Narra los resultados matemáticos de forma inmersiva. No menciones números de XP o daño a menos que sea necesario para la épica."
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
      narracion: muerto ? "Caes en batalla..." : (exito ? "Logras vencer." : "Recibes un golpe."),
      resultado
    };
  }
}

/**
 * Procesa la resurrección del jugador.
 */
export async function resucitarPersonaje(personajeId: string) {
  const charRef = doc(db, "personajes", personajeId);
  const charSnap = await getDoc(charRef);
  
  if (!charSnap.exists()) throw new Error("Personaje no encontrado");
  const character = charSnap.data() as Personaje;

  const nuevoHP = Math.floor(character.hpMax / 2);
  
  await updateDoc(charRef, {
    hpActual: nuevoHP,
    experiencia: 0 // Penalización: pierde XP actual
  });

  return { nuevoHP };
}
