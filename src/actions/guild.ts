"use server";

import { db } from "@/lib/firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { Personaje, Clase } from "@/types/game";
import { CLASES } from "@/data/compendium";

/**
 * Procesa la elección de clase en el Gremio y actualiza los atributos.
 */
export async function elegirClaseGremio(personajeId: string, partidaId: string, claseId: string) {
  const charRef = doc(db, "personajes", personajeId);
  const gameRef = doc(db, "partidas", partidaId);

  const charSnap = await getDoc(charRef);
  if (!charSnap.exists()) throw new Error("Personaje no encontrado");
  const character = charSnap.data() as Personaje;

  const claseElegida = CLASES.find(c => c.id === claseId);
  if (!claseElegida) throw new Error("Clase no válida");

  // Atributos base (10) + bonificadores
  const nuevosAtributos = {
    fuerza: 10 + claseElegida.bonificadores.fuerza,
    agilidad: 10 + claseElegida.bonificadores.agilidad,
    inteligencia: 10 + claseElegida.bonificadores.inteligencia
  };

  // 1. Actualizar Personaje
  await updateDoc(charRef, {
    clase: claseElegida.nombre,
    atributos: nuevosAtributos,
    hpMax: 20, // Opcional: ajustar según clase si se desea en el futuro
    hpActual: 20
  });

  // 2. Actualizar Partida a Fase Aventura
  await updateDoc(gameRef, {
    faseJuego: "aventura",
    timestamp: Date.now()
  });

  return { 
    nombreClase: claseElegida.nombre,
    atributos: nuevosAtributos
  };
}
