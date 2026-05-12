export const runtime = 'edge';
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { Personaje, Companero } from "@/types/game";
import { CLASES } from "@/data/compendium";
import Groq from "groq-sdk";

let _groq: Groq | null = null;
function getGroq() {
  if (!_groq) _groq = new Groq({ apiKey: process.env.GROQ_API_KEY_NARRADOR });
  return _groq;
}

function getTipoClase(claseId: string): "tanque" | "dps" | "soporte" {
  const tanques = ["vanguardia", "paladin_ocaso", "caballero_dragon", "templario_hierro"];
  const soporte = ["clerigo_sangre", "bardo_lamentos", "alquimista_plagas", "guardian_bosque", "oraculo_ciego"];

  if (tanques.includes(claseId)) return "tanque";
  if (soporte.includes(claseId)) return "soporte";
  return "dps";
}

export async function POST(req: NextRequest) {
  try {
    const { action, ...params } = await req.json();

    if (action === "elegirClaseGremio") {
      const { personajeId, partidaId, claseId } = params;
      const charRef = doc(db, "personajes", personajeId);
      const gameRef = doc(db, "partidas", partidaId);

      const charSnap = await getDoc(charRef);
      if (!charSnap.exists()) return NextResponse.json({ error: "Personaje no encontrado" }, { status: 404 });

      const claseElegida = CLASES.find((c: any) => c.id === claseId);
      if (!claseElegida) return NextResponse.json({ error: "Clase no válida" }, { status: 400 });

      const tipoElegido = getTipoClase(claseId);
      let clasesCompaneros: string[] = [];

      if (tipoElegido === "tanque") clasesCompaneros = ["dps", "soporte"];
      else if (tipoElegido === "soporte") clasesCompaneros = ["tanque", "dps"];
      else clasesCompaneros = ["tanque", "soporte"];

      const promptCompaneros = `Genera exactamente 2 compañeros para un grupo de RPG.
      Compañero 1: Clase tipo ${clasesCompaneros[0]}.
      Compañero 2: Clase tipo ${clasesCompaneros[1]}.
      Tono: Oscuro, fantasía épica.
      Devuelve SOLO un JSON con un array 'companeros' que contenga objetos con 'nombre', 'clase_especifica' (ej: 'Vanguardia'), 'actitud' (1 palabra ej: 'Cínico').`;

      const completion = await getGroq().chat.completions.create({
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
        clase: c.clase_especifica,
        hpMax: 20,
        hpActual: 20,
        mpMax: 20,
        mpActual: 20,
        actitud: c.actitud,
        status_effects: []
      }));

      const nuevosAtributos = {
        fuerza: 10 + claseElegida.bonificadores.fuerza,
        agilidad: 10 + claseElegida.bonificadores.agilidad,
        inteligencia: 10 + claseElegida.bonificadores.inteligencia
      };

      await updateDoc(charRef, {
        clase: claseElegida.nombre,
        atributos: nuevosAtributos,
        hpActual: 20
      });

      await updateDoc(gameRef, {
        grupo: grupo,
        faseJuego: "aventura",
        timestamp: Date.now()
      });

      return NextResponse.json({ 
        nombreClase: claseElegida.nombre,
        atributos: nuevosAtributos,
        grupo
      });
    }

    if (action === "gestionarGrupo") {
      const { partidaId, nuevoGrupo } = params;
      const gameRef = doc(db, "partidas", partidaId);
      
      await updateDoc(gameRef, {
        grupo: nuevoGrupo,
        timestamp: Date.now()
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("Error in guild API:", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
