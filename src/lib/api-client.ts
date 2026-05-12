import { Genero, RespuestaIA, Personaje, Companero, FaseJuego, EntidadTurno, Habilidad } from "@/types/game";

// ============ CHARACTER ============

export async function sugerirNombres(genero: Genero, raza: string): Promise<string[]> {
  const res = await fetch("/api/character", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "sugerirNombres", genero, raza }),
  });
  if (!res.ok) return ["Eldrin", "Thalindra", "Kaelen"];
  return res.json();
}

export async function sugerirNemesis(trasfondo: string): Promise<string[]> {
  const res = await fetch("/api/character", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "sugerirNemesis", trasfondo }),
  });
  if (!res.ok) return ["El Rey de las Sombras", "Malphas", "La Tejedora de Plagas"];
  return res.json();
}

export async function generarTrasfondosIA(): Promise<{ nombre: string; lore: string }[]> {
  const res = await fetch("/api/character", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "generarTrasfondosIA" }),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Error ${res.status} en generarTrasfondosIA`);
  }
  return res.json();
}

// ============ NARRATOR ============

export async function generarNarrativa(
  contextoActual: string,
  personaje: Personaje,
  fase: FaseJuego,
  grupo: Companero[] = []
): Promise<RespuestaIA> {
  const res = await fetch("/api/narrator", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contextoActual, personaje, fase, grupo }),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Error ${res.status} en el Agente Narrador`);
  }
  return res.json();
}

// ============ DIALOGUE ============

export async function hablarConNPC(
  mensajeUsuario: string,
  personaje: Personaje,
  grupo: Companero[],
  contextoNPC: string
) {
  const res = await fetch("/api/dialogue", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mensajeUsuario, personaje, grupo, contextoNPC }),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Error ${res.status} en Agente de Diálogo`);
  }
  return res.json();
}

// ============ GUILD ============

export async function elegirClaseGremio(personajeId: string, partidaId: string, claseId: string) {
  const res = await fetch("/api/guild", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "elegirClaseGremio", personajeId, partidaId, claseId }),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Error ${res.status} al elegir clase en el gremio`);
  }
  return res.json();
}

export async function gestionarGrupo(personajeId: string, partidaId: string, nuevoGrupo: Companero[]) {
  const res = await fetch("/api/guild", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "gestionarGrupo", personajeId, partidaId, nuevoGrupo }),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Error ${res.status} al gestionar grupo`);
  }
  return res.json();
}

// ============ COMBAT ============

export async function rollInitiative(personaje: Personaje, grupo: any[], enemigos: any[]): Promise<EntidadTurno[]> {
  const res = await fetch("/api/combat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "rollInitiative", personaje, grupo, enemigos }),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Error ${res.status} al rodar iniciativa`);
  }
  return res.json();
}

export async function procesarCombate(
  personajeId: string,
  habilidadId: string,
  partidaId: string,
  targetId: string
) {
  const res = await fetch("/api/combat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "procesarCombate", personajeId, habilidadId, partidaId, targetId }),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Error ${res.status} al procesar combate`);
  }
  return res.json();
}

export async function resucitarPersonaje(personajeId: string) {
  const res = await fetch("/api/combat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "resucitarPersonaje", personajeId }),
  });
  return res.json();
}

// ============ VISUALS ============

export async function generateAndStorePortrait(
  entidadId: string,
  coleccion: "personajes" | "partidas" | "enemigos",
  descripcion: string
) {
  const res = await fetch("/api/visuals", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ entidadId, coleccion, descripcion }),
  });
  return res.json();
}
