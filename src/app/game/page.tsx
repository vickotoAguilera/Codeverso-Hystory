"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { Personaje, Partida, RespuestaIA } from '@/types/game';
import { CharacterPanel } from '@/components/game/CharacterPanel';
import { generarNarrativa } from '@/actions/narrator';
import { procesarCombate, resucitarPersonaje } from '@/actions/combat';
import { elegirClaseGremio } from '@/actions/guild';
import { hablarConNPC } from '@/actions/dialogue';
import { CLASES } from '@/data/compendium';

export default function GamePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [personaje, setPersonaje] = useState<Personaje | null>(null);
  const [partida, setPartida] = useState<Partida | null>(null);
  const [narrativaActual, setNarrativaActual] = useState<RespuestaIA | null>(null);

  // Carga inicial de datos
  const loadGameData = useCallback(async (uid: string) => {
    try {
      // 1. Cargar Personaje
      const qChar = query(collection(db, "personajes"), where("usuarioId", "==", uid));
      const charSnap = await getDocs(qChar);
      
      if (charSnap.empty) {
        router.push('/create');
        return;
      }
      
      const charData = charSnap.docs[0].data() as Personaje;
      setPersonaje(charData);

      // 2. Cargar Partida
      const qGame = query(collection(db, "partidas"), where("personajeId", "==", charData.id));
      const gameSnap = await getDocs(qGame);
      
      if (gameSnap.empty) {
        router.push('/create');
        return;
      }

      const gameData = gameSnap.docs[0].data() as Partida;
      setPartida(gameData);
      setNarrativaActual(gameData.ultimaNarrativa);

      // 3. Iniciar Prólogo si es necesario
      if (gameData.faseJuego === 'prologo' && (!gameData.ultimaNarrativa || gameData.ultimaNarrativa.opciones.length === 0)) {
        await handleNextStep("Inicia la batalla final contra mi Némesis.", gameData, charData);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error loading game data:", error);
      router.push('/');
    }
  }, [router]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        loadGameData(user.uid);
      } else {
        router.push('/');
      }
    });
    return () => unsubscribe();
  }, [loadGameData, router]);

  const handleNextStep = async (eleccion: string, currentPartida: Partida, currentChar: Personaje) => {
    setActionLoading(true);
    try {
      // Lógica de Resurrección (Botón ID 999)
      if (eleccion === "Renacer en el Gremio (Coste: Perder XP actual)") {
        await resucitarPersonaje(currentChar.id);
        const promptResurrecion = "Has despertado en la enfermería del Gremio de Aventureros tras ser derrotado. Te sientes débil pero vivo.";
        const nuevaNarrativa = await generarNarrativa(promptResurrecion, currentChar, "aventura", currentPartida.grupo);
        
        const gameRef = doc(db, "partidas", currentPartida.id);
        await updateDoc(gameRef, { ultimaNarrativa: nuevaNarrativa });

        // Recargar personaje resucitado
        const charSnap = await getDoc(doc(db, "personajes", currentChar.id));
        if (charSnap.exists()) setPersonaje(charSnap.data() as Personaje);
        
        setPartida({ ...currentPartida, ultimaNarrativa: nuevaNarrativa });
        setNarrativaActual(nuevaNarrativa);
        return;
      }

      // Si estamos en prólogo...
      if (currentPartida.faseJuego === 'prologo') {
        const promptPrologo = `El jugador ha elegido: "${eleccion}". Narra cómo la batalla contra ${currentChar.nemesis} llega a su fin. Es una derrota inevitable. El jugador recibe un golpe devastador, todo se vuelve oscuro y despierta sin recuerdos frente al Gremio de Aventureros.`;
        
        const nuevaNarrativa = await generarNarrativa(promptPrologo, currentChar, "prologo", []);
        
        // Actualizar Firebase: Fase Llegada Gremio, HP 1
        const charRef = doc(db, "personajes", currentChar.id);
        const gameRef = doc(db, "partidas", currentPartida.id);

        await updateDoc(charRef, { hpActual: 1 });
        await updateDoc(gameRef, { 
          faseJuego: "llegada_gremio",
          ultimaNarrativa: nuevaNarrativa,
          timestamp: Date.now()
        });

        setPersonaje({ ...currentChar, hpActual: 1 });
        setPartida({ ...currentPartida, faseJuego: "llegada_gremio", ultimaNarrativa: nuevaNarrativa });
        setNarrativaActual(nuevaNarrativa);
      } else {
        // Fase Aventura normal
        const nuevaNarrativa = await generarNarrativa(eleccion, currentChar, "aventura", currentPartida.grupo);
        
        const gameRef = doc(db, "partidas", currentPartida.id);
        await updateDoc(gameRef, { 
          ultimaNarrativa: nuevaNarrativa,
          timestamp: Date.now()
        });

        setPartida({ ...currentPartida, ultimaNarrativa: nuevaNarrativa });
        setNarrativaActual(nuevaNarrativa);
      }
    } catch (error) {
      console.error("Error en el bucle de juego:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCombatAction = async (opcion: any) => {
    if (!personaje || !partida) return;
    setActionLoading(true);

    try {
      const { narracion, logs, combatResult } = await procesarCombate(
        personaje.id, 
        opcion.habilidad_id || "ID_CORTE_CRUZADO",
        partida.id,
        narrativaActual?.enemigos?.[0]?.id || ""
      );

      // Si el jugador murió o el enemigo murió, el Agente de Combate ya narró el impacto.
      // Pero necesitamos verificar el estado del personaje tras el combate.
      const charRef = doc(db, "personajes", personaje.id);
      const charSnap = await getDoc(charRef);
      const currentChar = charSnap.data() as Personaje;

      if (currentChar.hpActual <= 0) {
        const nuevaRespuesta: RespuestaIA = {
          narrativa: narracion || "Tu visión se desvanece...",
          opciones: [{
            id: 999,
            texto_boton: "Renacer en el Gremio (Coste: Perder XP actual)",
            tipo_accion: "narrativa"
          }]
        };

        const gameRef = doc(db, "partidas", partida.id);
        await updateDoc(gameRef, { 
          ultimaNarrativa: nuevaRespuesta,
          timestamp: Date.now()
        });

        setNarrativaActual(nuevaRespuesta);
        setPersonaje(currentChar);
        setPartida({ ...partida, ultimaNarrativa: nuevaRespuesta });
      } else {
        // Victoria o continuación
        const promptPostCombate = `Resultado del combate: ${narracion}. Continúa la historia basándote en este resultado.`;
        const nuevaNarrativa = await generarNarrativa(promptPostCombate, currentChar, "aventura", partida.grupo);

        const gameRef = doc(db, "partidas", partida.id);
        await updateDoc(gameRef, { 
          ultimaNarrativa: nuevaNarrativa,
          timestamp: Date.now()
        });

        setPersonaje(currentChar);
        setPartida({ ...partida, ultimaNarrativa: nuevaNarrativa });
        setNarrativaActual(nuevaNarrativa);
      }
    } catch (error) {
      console.error("Error en combate:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSelectClass = async (claseId: string) => {
    if (!personaje || !partida) return;
    setActionLoading(true);

    try {
      const { nombreClase, grupo } = await elegirClaseGremio(personaje.id, partida.id, claseId);
      
      // Usar Agente de Diálogo para la presentación formal
      const contextoNPC = `El Maestro del Gremio y los dos nuevos compañeros (${grupo[0].nombre} y ${grupo[1].nombre}) se presentan formalmente al jugador.`;
      const responseDialogue = await hablarConNPC(
        `He elegido el camino del ${nombreClase}. Preséntense y díganme qué haremos ahora.`,
        { ...personaje, clase: nombreClase },
        grupo,
        contextoNPC
      );

      // Sincronizar personaje con nueva clase
      const charSnap = await getDoc(doc(db, "personajes", personaje.id));
      if (charSnap.exists()) setPersonaje(charSnap.data() as Personaje);
      
      const nuevaNarrativa: RespuestaIA = {
        narrativa: responseDialogue.dialogo,
        opciones: responseDialogue.opciones_respuesta.map(o => ({
          id: o.id,
          texto_boton: o.texto,
          tipo_accion: "narrativa"
        }))
      };

      const gameRef = doc(db, "partidas", partida.id);
      await updateDoc(gameRef, { 
        ultimaNarrativa: nuevaNarrativa,
        timestamp: Date.now()
      });

      setPartida({ ...partida, faseJuego: "aventura", grupo: grupo, ultimaNarrativa: nuevaNarrativa });
      setNarrativaActual(nuevaNarrativa);
    } catch (error) {
      console.error("Error al elegir clase:", error);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading || !personaje || !partida) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-primary font-mono animate-pulse uppercase tracking-widest">Sincronizando con el Codeverso...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground p-4 lg:p-8 relative overflow-hidden flex flex-col lg:flex-row gap-8">
      {/* Background Aurora */}
      <div className="fixed inset-0 -z-10 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(64,230,255,0.1),transparent_70%)] animate-aurora"></div>
      </div>

      {/* Área Narrativa */}
      <div className="flex-1 flex flex-col gap-8 max-w-4xl mx-auto w-full order-2 lg:order-1">
        <div className="bg-card/50 backdrop-blur-md border border-border rounded-3xl p-8 shadow-2xl min-h-[400px] flex flex-col justify-between relative overflow-hidden">
          
          {/* Texto Narrativo */}
          <div className={`space-y-6 transition-opacity duration-500 ${actionLoading ? 'opacity-30' : 'opacity-100'}`}>
            <p className="text-xl leading-relaxed text-foreground/90 font-serif italic">
              {narrativaActual?.narrativa || "Las sombras se arremolinan a tu alrededor..."}
            </p>
          </div>

          {/* Loader de Acción */}
          {actionLoading && (
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                <span className="text-[10px] font-bold text-primary animate-pulse tracking-[0.2em] uppercase">Escribiendo el destino...</span>
              </div>
            </div>
          )}

          {/* Opciones / Botones */}
          <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 mt-12 transition-all duration-500 ${actionLoading ? 'pointer-events-none grayscale opacity-20' : 'opacity-100'}`}>
            {partida.faseJuego === 'llegada_gremio' ? (
              // Evento especial de Selección de Clase
              <>
                <div className="col-span-full mb-4 text-center">
                  <p className="text-secondary font-bold uppercase tracking-widest animate-pulse">Maestro del Gremio:</p>
                  <p className="text-foreground/80 italic">"Veo potencial en ti, amnésico. ¿Qué camino deseas forjar?"</p>
                </div>
                {CLASES.map((clase) => (
                  <button
                    key={clase.id}
                    onClick={() => handleSelectClass(clase.id)}
                    className="btn-shiny p-5 rounded-2xl text-left flex flex-col gap-2 group hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-secondary/60 uppercase tracking-widest">VOCACIÓN</span>
                      <div className="flex gap-2">
                        {Object.entries(clase.bonificadores).filter(([_,v]) => v !== 0).map(([k,v]) => (
                          <span key={k} className="text-[9px] bg-secondary/10 text-secondary px-1.5 py-0.5 rounded border border-secondary/20">
                            {k[0].toUpperCase()}{v > 0 ? '+' : ''}{v}
                          </span>
                        ))}
                      </div>
                    </div>
                    <span className="font-bold text-foreground group-hover:text-secondary transition-colors">{clase.nombre}</span>
                    <p className="text-[10px] text-foreground/40 leading-tight line-clamp-2">{clase.lore}</p>
                  </button>
                ))}
              </>
            ) : (
              // Bucle de Juego Normal
              narrativaActual?.opciones.map((opcion) => (
                <button
                  key={opcion.id}
                  onClick={() => {
                    if (opcion.tipo_accion === 'combate') {
                      handleCombatAction(opcion);
                    } else {
                      handleNextStep(opcion.texto_boton, partida, personaje);
                    }
                  }}
                  className="btn-shiny p-5 rounded-2xl text-left flex flex-col gap-2 group hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-primary/40 uppercase tracking-widest">{opcion.tipo_accion}</span>
                    {opcion.atributo_requerido && (
                      <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20">
                        {opcion.atributo_requerido.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span className="font-bold text-foreground group-hover:text-primary transition-colors">{opcion.texto_boton}</span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="flex justify-between items-center px-4">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] text-foreground/30 uppercase font-bold tracking-widest">Fase Actual</span>
              <span className="text-xs font-mono text-secondary uppercase">{partida.faseJuego}</span>
            </div>
          </div>
          <button 
            onClick={() => router.push('/')}
            className="text-[10px] text-foreground/20 hover:text-accent transition-colors uppercase font-bold tracking-widest"
          >
            Abandonar Partida
          </button>
        </div>
      </div>

      {/* Panel Lateral de Personaje */}
      <aside className="order-1 lg:order-2">
        <CharacterPanel personaje={personaje} grupo={partida.grupo} />
      </aside>
    </main>
  );
}
