"use server";
import Groq from "groq-sdk";
import { db } from "@/lib/firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { Personaje, Elemento, LogEntry, EntidadTurno, Partida, Habilidad } from "@/types/game";
import { generateNewSkill } from "./skills";

const groq = new Groq({ 
  apiKey: process.env.GROQ_API_KEY_COMBATE 
});

/**
 * Lanza la iniciativa para todos los participantes al inicio de un encuentro.
 */
export async function rollInitiative(personaje: Personaje, grupo: any[], enemigos: any[]): Promise<EntidadTurno[]> {
  const participantes: EntidadTurno[] = [
    { 
      id: personaje.id, 
      nombre: personaje.nombre, 
      tipo: "heroe", 
      iniciativa: Math.floor(Math.random() * 20) + 1 + (personaje.atributos.agilidad || 10),
      velocidad: personaje.atributos.agilidad || 10,
      status_effects: personaje.status_effects || []
    },
    ...grupo.map(g => ({
      id: g.id, 
      nombre: g.nombre, 
      tipo: "heroe" as const, 
      iniciativa: Math.floor(Math.random() * 20) + 1 + 10,
      velocidad: 10,
      status_effects: g.status_effects || []
    })),
    ...enemigos.map(e => ({
      id: e.id, 
      nombre: e.nombre, 
      tipo: "enemigo" as const, 
      iniciativa: Math.floor(Math.random() * 20) + 1 + (e.velocidad || 10),
      velocidad: e.velocidad || 10,
      status_effects: e.status_effects || []
    }))
  ];

  return participantes.sort((a, b) => b.iniciativa - a.iniciativa);
}

/**
 * Ejecuta una habilidad traduciendo la lógica matemática de Python a TypeScript.
 */
export async function executeSkill(
  attacker: Personaje | any, // Puede ser héroe o enemigo
  target: any,
  skill: Habilidad
) {
  const roll = Math.floor(Math.random() * 20) + 1;
  const isCritical = roll === 20;
  
  let damageBase = skill.poder;
  const statMultiplier = skill.tipo === "Magia Negra" ? (attacker.atributos?.inteligencia || attacker.inteligencia || 10) : (attacker.atributos?.fuerza || attacker.fuerza || 10);
  
  damageBase += statMultiplier;
  let finalDamage = Math.floor(Math.random() * 5) + (damageBase - 2); // Rango de +/- 2
  
  if (isCritical) {
    finalDamage *= 2;
  }

  const result = {
    damage: finalDamage,
    isCritical,
    mpRestored: isCritical ? (attacker.mpMax || 20) : 0,
    statusEffectApplied: skill.efecto ? {
      tipo: skill.efecto,
      duracion: skill.dot_duracion || 3,
      valor: skill.dot_dano || 10
    } : null
  };

  return result;
}

/**
 * Procesa un turno de combate integrando iniciativa, habilidades y críticos.
 */
export async function procesarCombate(
  personajeId: string,
  habilidadId: string,
  partidaId: string,
  targetId: string
) {
  const charRef = doc(db, "personajes", personajeId);
  const gameRef = doc(db, "partidas", partidaId);
  
  const [charSnap, gameSnap] = await Promise.all([getDoc(charRef), getDoc(gameRef)]);
  if (!charSnap.exists() || !gameSnap.exists()) throw new Error("Datos no encontrados");
  
  const character = charSnap.data() as Personaje;
  const partida = gameSnap.data() as Partida;
  
  // Buscar la habilidad
  let skill: Habilidad;
  const isSistemaAtaque = habilidadId === "SISTEMA_ATAQUE";
  const isSistemaDefensa = habilidadId === "SISTEMA_DEFENSA";

  if (isSistemaAtaque) {
    skill = {
      id: "SISTEMA_ATAQUE",
      nombre: "Ataque Básico",
      tipo: "Habilidad Fisica",
      poder: 15,
      costo_mp: 0,
      elemento: "Físico",
      descripcion: "Ataque básico",
      alcance: "Un Enemigo"
    };
  } else if (isSistemaDefensa) {
    skill = {
      id: "SISTEMA_DEFENSA",
      nombre: "Defender",
      tipo: "Habilidad Defensa",
      poder: 0,
      costo_mp: 0,
      elemento: "Físico",
      descripcion: "Defensa",
      alcance: "Usuario"
    };
  } else {
    // Buscar en desbloqueadas o ultimate de la clase
    const allSkills = [
      ...(character.habilidades_desbloqueadas || []),
      ...(character.habilidades_equipadas?.filter(s => s !== null) as Habilidad[] || [])
    ];
    
    // También buscar en el compendio si es una de las básicas de prueba
    const foundSkill = allSkills.find(s => s.id === habilidadId);
    
    if (foundSkill) {
      skill = foundSkill;
    } else {
      // Por ahora, fallback a las de prueba o buscar en el compendio global (simplificado)
      skill = habilidadId === "ID_PIRO" ? 
        { id: "ID_PIRO", nombre: "Piro", tipo: "Magia Negra", poder: 25, costo_mp: 5, elemento: "Fuego", efecto: "DOT_QUEMADURA", dot_duracion: 3, dot_dano: 15, descripcion: "Daña con fuego", alcance: "Un Enemigo" } :
        { id: "ID_CORTE_CRUZADO", nombre: "Corte Cruzado", tipo: "Habilidad Fisica", poder: 25, costo_mp: 5, elemento: "Físico", descripcion: "Ataque físico", alcance: "Un Enemigo" };
    }
  }

  const target = isSistemaDefensa ? character : partida.ultimaNarrativa.enemigos?.find(e => e.id === targetId);
  if (!target && !isSistemaDefensa) throw new Error("Objetivo no encontrado");

  const roll = Math.floor(Math.random() * 20) + 1;
  const combatResult = await executeSkill(character, target, skill);
  
  // Lógica especial de MP para Ataque Básico
  let mpGanado = 0;
  if (isSistemaAtaque) {
    mpGanado = roll; // Restaura MP basado en el dado
  }

  // Actualizar estados
  let nuevoHP_Enemigo = target && !isSistemaDefensa ? Math.max(0, target.hpActual - combatResult.damage) : 0;
  let nuevoMP_Heroe = Math.min(character.mpMax, Math.max(0, character.mpActual - skill.costo_mp + mpGanado));
  
  if (combatResult.isCritical && !isSistemaAtaque) {
    nuevoMP_Heroe = character.mpMax;
  }
  
  const logs: LogEntry[] = [{
    id: crypto.randomUUID(),
    tipo: "combate",
    mensaje: isSistemaDefensa 
      ? `¡${character.nombre} se pone en guardia!`
      : `¡${character.nombre} usa ${skill.nombre}! ${isSistemaAtaque ? `Restaura ${mpGanado} MP. ` : ""}Inflige ${combatResult.damage} de daño. ${combatResult.isCritical ? "¡GOLPE CRÍTICO!" : ""}`,
    timestamp: Date.now(),
    isCritical: combatResult.isCritical
  }];

  // Persistir cambios
  await updateDoc(charRef, {
    mpActual: nuevoMP_Heroe,
    status_effects: isSistemaDefensa 
      ? [...(character.status_effects || []), { id: crypto.randomUUID(), tipo: "HOT_REGENERACION", duracion: 1, valor: 5 }] // Simplificado como buff
      : character.status_effects
  });

  const nuevosEnemigos = target && !isSistemaDefensa ? partida.ultimaNarrativa.enemigos?.map(e => 
    e.id === targetId ? { ...e, hpActual: nuevoHP_Enemigo } : e
  ) : partida.ultimaNarrativa.enemigos;

  await updateDoc(gameRef, {
    "ultimaNarrativa.enemigos": nuevosEnemigos,
    combateLog: [...(partida.combateLog || []), ...logs].slice(-20)
  });

  // Llamada al Agente de Combate para narrar
  try {
    const prompt = combatResult.isCritical 
      ? `¡GOLPE CRÍTICO NATURAL 20! El jugador desata un poder inmenso con ${skill.nombre}. Narra este momento épico.`
      : `El jugador usa ${skill.nombre} contra un enemigo. Inflige ${combatResult.damage} de daño. Narra el impacto de forma inmersiva.`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: "Eres el Agente de Combate. Narra con estilo CRPG oscuro." },
        { role: "user", content: prompt }
      ],
      model: "llama-3.3-versatile",
    });

    return {
      narracion: completion.choices[0].message.content,
      combatResult,
      logs
    };
  } catch (error) {
    return { narracion: "El combate continúa...", combatResult, logs };
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
  const viejaXP = character.experiencia;
  const xpGanada = 50; // Ejemplo de ganancia de XP para probar subida de nivel
  let nuevaXP = viejaXP + xpGanada;
  let nuevoNivel = character.nivel;
  let habilidadesNuevas: Habilidad[] = [];

  // Lógica de Subida de Nivel
  if (nuevaXP >= character.xpNecesaria) {
    nuevoNivel += 1;
    nuevaXP -= character.xpNecesaria;
    
    // Verificación matemática: cada 3 niveles se genera una habilidad procedural
    if (nuevoNivel % 3 === 0) {
      const skill = await generateNewSkill(character);
      habilidadesNuevas.push(skill);
    }
  }
  
  await updateDoc(charRef, {
    hpActual: nuevoHP,
    experiencia: nuevaXP,
    nivel: nuevoNivel,
    xpNecesaria: 100 + (nuevoNivel * 50) // Escala de XP
  });

  return { nuevoHP, nuevoNivel, habilidadesNuevas };
}
