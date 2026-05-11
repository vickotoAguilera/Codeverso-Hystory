"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { Personaje, Partida, RespuestaIA } from '@/types/game';
import { CharacterPanel } from '@/components/game/CharacterPanel';
import { generarNarrativa } from '@/actions/narrator';
import { procesarCombate } from '@/actions/combat';

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
      // Si estamos en prólogo, forzamos la derrota narrativa
      if (currentPartida.faseJuego === 'prologo') {
        const promptPrologo = `El jugador ha elegido: "${eleccion}". Narra cómo la batalla contra ${currentChar.nemesis} llega a su fin. Es una derrota inevitable. El jugador recibe un golpe devastador, todo se vuelve oscuro y despierta sin recuerdos frente al Gremio de Aventureros.`;
        
        const nuevaNarrativa = await generarNarrativa(promptPrologo, currentChar, "prologo", []);
        
        // Actualizar Firebase: Fase Aventura, HP 1
        const charRef = doc(db, "personajes", currentChar.id);
        const gameRef = doc(db, "partidas", currentPartida.id);

        await updateDoc(charRef, { hpActual: 1 });
        await updateDoc(gameRef, { 
          faseJuego: "aventura",
          ultimaNarrativa: nuevaNarrativa,
          timestamp: Date.now()
        });

        setPersonaje({ ...currentChar, hpActual: 1 });
        setPartida({ ...currentPartida, faseJuego: "aventura", ultimaNarrativa: nuevaNarrativa });
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
      const atributoValor = personaje.atributos[opcion.atributo_requerido as keyof typeof personaje.atributos] || 10;
      const { narracion, resultado } = await procesarCombate(atributoValor, opcion.atributo_requerido || "fuerza");

      // Actualizar HP del personaje si recibió daño (en este ejemplo simplificado solo narramos)
      // En una versión más compleja, la IA podría devolver cuánto daño hace el enemigo
      
      const promptPostCombate = `Resultado del combate: ${narracion}. El jugador usó ${opcion.texto_boton}. Continúa la historia basándote en este resultado.`;
      const nuevaNarrativa = await generarNarrativa(promptPostCombate, personaje, "aventura", partida.grupo);

      const gameRef = doc(db, "partidas", partida.id);
      await updateDoc(gameRef, { 
        ultimaNarrativa: nuevaNarrativa,
        timestamp: Date.now()
      });

      setPartida({ ...partida, ultimaNarrativa: nuevaNarrativa });
      setNarrativaActual(nuevaNarrativa);
    } catch (error) {
      console.error("Error en combate:", error);
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
            {narrativaActual?.opciones.map((opcion) => (
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
            ))}
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
