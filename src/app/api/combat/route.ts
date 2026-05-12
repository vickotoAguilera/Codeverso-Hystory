export const runtime = 'edge';
import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { db } from "@/lib/firebase";
import { doc, updateDoc, getDoc, collection, addDoc, getDocs, query, limit, arrayUnion } from "firebase/firestore";
import { Personaje, Habilidad, LogEntry, Partida } from "@/types/game";

let _groq: Groq | null = null;
function getGroq() {
  if (!_groq) _groq = new Groq({ apiKey: process.env.GROQ_API_KEY_COMBATE });
  return _groq;
}

let _groqWizard: Groq | null = null;
function getGroqWizard() {
  if (!_groqWizard) _groqWizard = new Groq({ apiKey: process.env.GROQ_API_KEY_WIZARD || process.env.GROQ_API_KEY_NARRADOR });
  return _groqWizard;
}

async function generateNewSkill(character: Personaje): Promise<Habilidad> {
  try {
    const skillsRef = collection(db, "habilidades_persistentes");
    const q = query(skillsRef, limit(3));
    const querySnapshot = await getDocs(q);
    const inspirationSkills = querySnapshot.docs.map(doc => doc.data() as Habilidad);

    const inspirationContext = inspirationSkills.length > 0 
      ? `Usa estas habilidades existentes como inspiración para mantener el equilibrio y el tono: ${inspirationSkills.map(s => s.nombre).join(", ")}.`
      : "Esta es una de las primeras habilidades del multiverso. Sé creativo pero mantén el equilibrio.";

    const prompt = `Genera una nueva habilidad épica y única para un personaje de RPG.
    DATOS DEL PERSONAJE:
    - Clase: ${character.clase}
    - Raza: ${character.raza}
    - Estética/Contexto: ${character.narrative_context}
    - Nivel Actual: ${character.nivel}

    ${inspirationContext}

    REGLAS DE GENERACIÓN:
    1. El nombre debe ser evocador y coherente con la clase.
    2. El costo de MP debe ser proporcional al poder (nivel ${character.nivel}).
    3. El poder base debe estar entre ${20 + (character.nivel * 2)} y ${40 + (character.nivel * 3)}.
    4. El tipo debe ser uno de: "Habilidad Fisica", "Magia Negra", "Magia Blanca", "Habilidad Defensa".
    5. El alcance debe ser uno de: "Un Enemigo", "Todos Enemigos", "Un Aliado", "Todos Aliados", "Usuario".
    6. Opcionalmente, añade un efecto de estado (DOT_QUEMADURA, DOT_SANGRADO, DOT_VENENO, HOT_REGENERACION).

    RESPONDE EXCLUSIVAMENTE EN FORMATO JSON:
    {
      "nombre": "...",
      "descripcion": "...",
      "tipo": "...",
      "costo_mp": 0,
      "poder": 0,
      "alcance": "...",
      "elemento": "Fuego|Agua|Viento|Tierra|Físico",
      "efecto": "..." (opcional),
      "dot_duracion": 0 (opcional),
      "dot_dano": 0 (opcional)
    }`;

    const completion = await getGroqWizard().chat.completions.create({
      messages: [
        { role: "system", content: "Eres un diseñador de sistemas RPG experto en balance y narrativa emergente." },
        { role: "user", content: prompt }
      ],
      model: "llama-3.3-versatile",
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0].message.content;
    if (!content) throw new Error("La IA no generó contenido para la habilidad");

    const newSkillData = JSON.parse(content);
    const newSkill: Habilidad = {
      ...newSkillData,
      id: `proc_${crypto.randomUUID()}`
    };

    await addDoc(collection(db, "habilidades_persistentes"), {
      ...newSkill,
      claseOriginal: character.clase,
      creadaPor: character.nombre,
      timestamp: Date.now()
    });

    const charRef = doc(db, "personajes", character.id);
    await updateDoc(charRef, {
      habilidades_desbloqueadas: arrayUnion(newSkill)
    });

    return newSkill;
  } catch (error) {
    console.error("Error generating procedural skill:", error);
    return {
      id: "error_fallback",
      nombre: "Resiliencia Forzada",
      descripcion: "Una chispa de energía pura surge en un momento crítico.",
      tipo: "Habilidad Defensa",
      costo_mp: 0,
      poder: 10,
      alcance: "Usuario",
      elemento: "Físico"
    };
  }
}

export async function POST(req: NextRequest) {
  try {
    const { action, ...params } = await req.json();

    if (action === "rollInitiative") {
      const { personaje, grupo, enemigos } = params;
      const participantes = [
        { 
          id: personaje.id, nombre: personaje.nombre, tipo: "heroe", 
          iniciativa: Math.floor(Math.random() * 20) + 1 + (personaje.atributos.agilidad || 10),
          velocidad: personaje.atributos.agilidad || 10,
          status_effects: personaje.status_effects || []
        },
        ...grupo.map((g: any) => ({
          id: g.id, nombre: g.nombre, tipo: "heroe" as const, 
          iniciativa: Math.floor(Math.random() * 20) + 1 + 10,
          velocidad: 10, status_effects: g.status_effects || []
        })),
        ...enemigos.map((e: any) => ({
          id: e.id, nombre: e.nombre, tipo: "enemigo" as const, 
          iniciativa: Math.floor(Math.random() * 20) + 1 + (e.velocidad || 10),
          velocidad: e.velocidad || 10, status_effects: e.status_effects || []
        }))
      ];
      return NextResponse.json(participantes.sort((a, b) => b.iniciativa - a.iniciativa));
    }

    if (action === "procesarCombate") {
      const { personajeId, habilidadId, partidaId, targetId } = params;
      const charRef = doc(db, "personajes", personajeId);
      const gameRef = doc(db, "partidas", partidaId);
      
      const [charSnap, gameSnap] = await Promise.all([getDoc(charRef), getDoc(gameRef)]);
      if (!charSnap.exists() || !gameSnap.exists()) return NextResponse.json({ error: "Datos no encontrados" }, { status: 404 });
      
      const character = charSnap.data() as Personaje;
      const partida = gameSnap.data() as Partida;
      
      let skill: Habilidad;
      const isSistemaAtaque = habilidadId === "SISTEMA_ATAQUE";
      const isSistemaDefensa = habilidadId === "SISTEMA_DEFENSA";

      if (isSistemaAtaque) {
        skill = { id: "SISTEMA_ATAQUE", nombre: "Ataque Básico", tipo: "Habilidad Fisica", poder: 15, costo_mp: 0, elemento: "Físico", descripcion: "Ataque básico", alcance: "Un Enemigo" };
      } else if (isSistemaDefensa) {
        skill = { id: "SISTEMA_DEFENSA", nombre: "Defender", tipo: "Habilidad Defensa", poder: 0, costo_mp: 0, elemento: "Físico", descripcion: "Defensa", alcance: "Usuario" };
      } else {
        const allSkills = [
          ...(character.habilidades_desbloqueadas || []),
          ...(character.habilidades_equipadas?.filter(s => s !== null) as Habilidad[] || [])
        ];
        const foundSkill = allSkills.find(s => s.id === habilidadId);
        if (foundSkill) {
          skill = foundSkill;
        } else {
          skill = habilidadId === "ID_PIRO" ? 
            { id: "ID_PIRO", nombre: "Piro", tipo: "Magia Negra", poder: 25, costo_mp: 5, elemento: "Fuego", efecto: "DOT_QUEMADURA", dot_duracion: 3, dot_dano: 15, descripcion: "Daña con fuego", alcance: "Un Enemigo" } :
            { id: "ID_CORTE_CRUZADO", nombre: "Corte Cruzado", tipo: "Habilidad Fisica", poder: 25, costo_mp: 5, elemento: "Físico", descripcion: "Ataque físico", alcance: "Un Enemigo" };
        }
      }

      const target = isSistemaDefensa ? character : partida.ultimaNarrativa.enemigos?.find(e => e.id === targetId);
      if (!target && !isSistemaDefensa) return NextResponse.json({ error: "Objetivo no encontrado" }, { status: 404 });

      const roll = Math.floor(Math.random() * 20) + 1;
      const isCritical = roll === 20;
      
      let damageBase = skill.poder;
      const statMultiplier = skill.tipo === "Magia Negra" ? (character.atributos?.inteligencia || 10) : (character.atributos?.fuerza || 10);
      damageBase += statMultiplier;
      let finalDamage = Math.floor(Math.random() * 5) + (damageBase - 2);
      if (isCritical) finalDamage *= 2;

      const combatResult = {
        damage: finalDamage,
        isCritical,
        mpRestored: isCritical ? (character.mpMax || 20) : 0,
        statusEffectApplied: skill.efecto ? { tipo: skill.efecto, duracion: skill.dot_duracion || 3, valor: skill.dot_dano || 10 } : null
      };

      let mpGanado = 0;
      if (isSistemaAtaque) mpGanado = roll;

      const nuevoHP_Enemigo = target && !isSistemaDefensa ? Math.max(0, (target as any).hpActual - combatResult.damage) : 0;
      let nuevoMP_Heroe = Math.min(character.mpMax, Math.max(0, character.mpActual - skill.costo_mp + mpGanado));
      if (combatResult.isCritical && !isSistemaAtaque) nuevoMP_Heroe = character.mpMax;
      
      const logs: LogEntry[] = [{
        id: crypto.randomUUID(),
        tipo: "combate",
        mensaje: isSistemaDefensa 
          ? `¡${character.nombre} se pone en guardia!`
          : `¡${character.nombre} usa ${skill.nombre}! ${isSistemaAtaque ? `Restaura ${mpGanado} MP. ` : ""}Inflige ${combatResult.damage} de daño. ${combatResult.isCritical ? "¡GOLPE CRÍTICO!" : ""}`,
        timestamp: Date.now(),
        isCritical: combatResult.isCritical
      }];

      await updateDoc(charRef, {
        mpActual: nuevoMP_Heroe,
        status_effects: isSistemaDefensa 
          ? [...(character.status_effects || []), { id: crypto.randomUUID(), tipo: "HOT_REGENERACION", duracion: 1, valor: 5 }]
          : character.status_effects
      });

      const nuevosEnemigos = target && !isSistemaDefensa ? partida.ultimaNarrativa.enemigos?.map(e => 
        e.id === targetId ? { ...e, hpActual: nuevoHP_Enemigo } : e
      ) : partida.ultimaNarrativa.enemigos;

      await updateDoc(gameRef, {
        "ultimaNarrativa.enemigos": nuevosEnemigos,
        combateLog: [...(partida.combateLog || []), ...logs].slice(-20)
      });

      try {
        const prompt = combatResult.isCritical 
          ? `¡GOLPE CRÍTICO NATURAL 20! El jugador desata un poder inmenso con ${skill.nombre}. Narra este momento épico.`
          : `El jugador usa ${skill.nombre} contra un enemigo. Inflige ${combatResult.damage} de daño. Narra el impacto de forma inmersiva.`;

        const completion = await getGroq().chat.completions.create({
          messages: [
            { role: "system", content: "Eres el Agente de Combate. Narra con estilo CRPG oscuro." },
            { role: "user", content: prompt }
          ],
          model: "llama-3.3-versatile",
        });

        return NextResponse.json({ narracion: completion.choices[0].message.content, combatResult, logs });
      } catch {
        return NextResponse.json({ narracion: "El combate continúa...", combatResult, logs });
      }
    }

    if (action === "resucitarPersonaje") {
      const { personajeId } = params;
      const charRef = doc(db, "personajes", personajeId);
      const charSnap = await getDoc(charRef);
      
      if (!charSnap.exists()) return NextResponse.json({ error: "Personaje no encontrado" }, { status: 404 });
      const character = charSnap.data() as Personaje;

      const nuevoHP = Math.floor(character.hpMax / 2);
      const xpGanada = 50;
      let nuevaXP = character.experiencia + xpGanada;
      let nuevoNivel = character.nivel;
      let habilidadesNuevas: Habilidad[] = [];

      if (nuevaXP >= character.xpNecesaria) {
        nuevoNivel += 1;
        nuevaXP -= character.xpNecesaria;
        if (nuevoNivel % 3 === 0) {
          const skill = await generateNewSkill(character);
          habilidadesNuevas.push(skill);
        }
      }
      
      await updateDoc(charRef, {
        hpActual: nuevoHP,
        experiencia: nuevaXP,
        nivel: nuevoNivel,
        xpNecesaria: 100 + (nuevoNivel * 50)
      });

      return NextResponse.json({ nuevoHP, nuevoNivel, habilidadesNuevas });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("Error in combat API:", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
