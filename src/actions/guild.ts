"use server";

import { db } from "@/lib/firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { Personaje, Clase, Companero } from "@/types/game";
import { CLASES } from "@/data/compendium";
import Groq from "groq-sdk";

const groq = new Groq({ 
  apiKey: process.env.GROQ_API_KEY_NARRADOR 
});

/**
 * Determina el tipo de clase (Tanque, DPS, Soporte).
 */
function getTipoClase(claseId: string): "tanque" | "dps" | "soporte" {
  const tanques = ["vanguardia", "paladin_ocaso", "caballero_dragon", "templario_hierro"];
  const dps = ["sombra", "berserker_runico", "cazador_bestias", "monje_cenizas", "bailarin_espadas", "ingeniero_asedio", "mago_arcano", "nigromante", "invocador_vacio", "ilusionista", "segador_almas"];
  const soporte = ["clerigo_sangre", "bardo_lamentos", "alquimista_plagas", "guardian_bosque", "oraculo_ciego"];

  if (tanques.includes(claseId)) return "tanque";
  if (soporte.includes(claseId)) return "soporte";
  return "dps";
}

/**
 * Procesa la elección de clase en el Gremio y forma la Tríada.
 */
export async function elegirClaseGremio(personajeId: string, partidaId: string, claseId: string) {
  const charRef = doc(db, "personajes", personajeId);
  const gameRef = doc(db, "partidas", partidaId);

  const charSnap = await getDoc(charRef);
  if (!charSnap.exists()) throw new Error("Personaje no encontrado");
  const character = charSnap.data() as Personaje;

  const claseElegida = CLASES.find(c => c.id === claseId);
  if (!claseElegida) throw new Error("Clase no válida");

  // 1. Lógica de Equilibrio de la Tríada
  const tipoElegido = getTipoClase(claseId);
  let clasesCompaneros: string[] = [];

  if (tipoElegido === "tanque") clasesCompaneros = ["dps", "soporte"];
  else if (tipoElegido === "soporte") clasesCompaneros = ["tanque", "dps"];
  else clasesCompaneros = ["tanque", "soporte"];

  // 2. Generar Nombres y Actitud por IA para los compañeros
  const promptCompaneros = `Genera exactamente 2 compañeros para un grupo de RPG.
  Compañero 1: Clase tipo ${clasesCompaneros[0]}.
  Compañero 2: Clase tipo ${clasesCompaneros[1]}.
  Tono: Oscuro, fantasía épica.
  Devuelve SOLO un JSON con un array 'companeros' que contenga objetos con 'nombre', 'clase_especifica' (ej: 'Vanguardia'), 'actitud' (1 palabra ej: 'Cínico').`;

  const completion = await groq.chat.completions.create({
    messages: [
      { role: "system", content: "Eres un creador de personajes secundarios memorables. Responde solo en JSON." },
      { role: "user", content: promptCompaneros }
    ],
    model: "llama-3.3-versatile",
    response_format: { type: "json_object" }
  });

  const content = completion.choices[0].message.content;
  const { companeros: rawCompaneros } = JSON.parse(content || '{"companeros":[]}');

  const grupo: Companero[] = rawCompaneros.map((c: any) => ({
    id: crypto.randomUUID(),
    nombre: c.nombre,
    clase: c.clase_especifica as any, // Se mapeará a la interfaz Compañero simplificada
    hpMax: 20,
    hpActual: 20,
    actitud: c.actitud // Opcional, para el Agente de Diálogo
  }));

  // 3. Atributos base (10) + bonificadores
  const nuevosAtributos = {
    fuerza: 10 + claseElegida.bonificadores.fuerza,
    agilidad: 10 + claseElegida.bonificadores.agilidad,
    inteligencia: 10 + claseElegida.bonificadores.inteligencia
  };

  // 4. Actualizar Personaje
  await updateDoc(charRef, {
    clase: claseElegida.nombre,
    atributos: nuevosAtributos,
    hpActual: 20
  });

  // 5. Actualizar Partida con el Grupo y Fase Aventura
  await updateDoc(gameRef, {
    grupo: grupo,
    faseJuego: "aventura",
    timestamp: Date.now()
  });

  return { 
    nombreClase: claseElegida.nombre,
    atributos: nuevosAtributos,
    grupo
  };
}
