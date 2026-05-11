"use server";

import Groq from "groq-sdk";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, query, limit, doc, updateDoc, arrayUnion } from "firebase/firestore";
import { Personaje, Habilidad } from "@/types/game";

const groq = new Groq({ 
  apiKey: process.env.GROQ_API_KEY_WIZARD // Usamos Wizard para generación de contenido estático/procedural
});

/**
 * Genera una nueva habilidad procedural para el personaje basada en su clase y estética.
 * Se dispara cada 3 niveles.
 */
export async function generateNewSkill(character: Personaje): Promise<Habilidad> {
  try {
    // 1. Obtener 3 habilidades aleatorias de la colección global para inspiración
    const skillsRef = collection(db, "habilidades_persistentes");
    const q = query(skillsRef, limit(3));
    const querySnapshot = await getDocs(q);
    const inspirationSkills = querySnapshot.docs.map(doc => doc.data() as Habilidad);

    const inspirationContext = inspirationSkills.length > 0 
      ? `Usa estas habilidades existentes como inspiración para mantener el equilibrio y el tono: ${inspirationSkills.map(s => s.nombre).join(", ")}.`
      : "Esta es una de las primeras habilidades del multiverso. Sé creativo pero mantén el equilibrio.";

    // 2. Solicitar a la IA la generación de la nueva habilidad
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

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "Eres un diseñador de sistemas RPG experto en balance y narrativa emergente."
        },
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

    // 3. Guardar en la colección global 'habilidades_persistentes'
    await addDoc(collection(db, "habilidades_persistentes"), {
      ...newSkill,
      claseOriginal: character.clase,
      creadaPor: character.nombre,
      timestamp: Date.now()
    });

    // 4. Asignar al personaje localmente
    const charRef = doc(db, "personajes", character.id);
    await updateDoc(charRef, {
      // Usamos habilidades_desbloqueadas como array de IDs o de objetos completos según convenga
      // Aquí asumiremos que Personaje tiene un campo habilidades_desbloqueadas (array de Habilidad)
      habilidades_desbloqueadas: arrayUnion(newSkill)
    });

    return newSkill;
  } catch (error) {
    console.error("Error generating procedural skill:", error);
    // Habilidad por defecto en caso de error
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
