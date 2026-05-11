"use client";

import React, { useState } from 'react';
import { RAZAS, CLASES, TRASFONDOS } from '@/data/compendium';
import { Genero } from '@/types/game';
import { sugerirNombres, sugerirNemesis } from '@/actions/character';
import { db, auth } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export default function CharacterCreation() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selections, setSelections] = useState({
    genero: '' as Genero,
    raza: RAZAS[0],
    clase: CLASES[0],
    trasfondo: TRASFONDOS[0],
    nombre: '',
    nemesis: ''
  });
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [nameError, setNameError] = useState('');

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const validateName = (name: string) => {
    const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ]{1,8}$/;
    if (name.length === 0) {
      setNameError('');
      return false;
    }
    if (!regex.test(name)) {
      setNameError('Solo se permiten hasta 8 letras, sin espacios ni números.');
      return false;
    }
    setNameError('');
    return true;
  };

  const fetchNemesis = async (t: string) => {
    setLoading(true);
    const enemies = await sugerirNemesis(t);
    setSuggestions(enemies);
    setLoading(false);
  };

  const finalizeCreation = async () => {
    if (!auth.currentUser) return;
    setLoading(true);

    const characterId = crypto.randomUUID();
    const gameId = crypto.randomUUID();

    // Calcular atributos base (10) + bonificadores
    const finalAttributes = {
      fuerza: 10 + selections.clase.bonificadores.fuerza,
      agilidad: 10 + selections.clase.bonificadores.agilidad,
      inteligencia: 10 + selections.clase.bonificadores.inteligencia
    };

    try {
      // 1. Guardar Personaje
      await setDoc(doc(db, "personajes", characterId), {
        id: characterId,
        usuarioId: auth.currentUser.uid,
        nombre: selections.nombre,
        genero: selections.genero,
        raza: selections.raza.nombre,
        clase: selections.clase.nombre,
        trasfondo: selections.trasfondo.nombre,
        nemesis: selections.nemesis,
        hpActual: 20,
        hpMax: 20,
        atributos: finalAttributes,
        inventario: [],
        nivel: 1,
        experiencia: 0
      });

      // 2. Guardar Partida (Fase Prólogo)
      await setDoc(doc(db, "partidas", gameId), {
        id: gameId,
        personajeId: characterId,
        grupo: [],
        faseJuego: "prologo",
        ultimaNarrativa: { narrativa: "Comienza el prólogo...", opciones: [] },
        timestamp: Date.now()
      });

      router.push('/game');
    } catch (error) {
      console.error("Error saving character:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background Aurora */}
      <div className="absolute inset-0 -z-10 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(64,230,255,0.15),transparent_70%)] animate-aurora"></div>
      </div>

      <div className="max-w-4xl w-full bg-card/80 backdrop-blur-xl border border-border rounded-3xl p-8 shadow-2xl relative z-10">
        
        {/* Progress Bar */}
        <div className="w-full h-1 bg-border/30 rounded-full mb-8 overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-500 shadow-[0_0_10px_rgba(64,230,255,0.5)]" 
            style={{ width: `${(step / 6) * 100}%` }}
          />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-primary font-mono animate-pulse">CANALIZANDO ENERGÍAS...</p>
          </div>
        ) : (
          <>
            {/* Paso 1: Género */}
            {step === 1 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-3xl font-bold text-gradient mb-4">¿Cuál es la naturaleza de tu alma?</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                  {(["hombre", "mujer", "no_binario"] as const).map((g) => (
                    <button
                      key={g}
                      onClick={() => { setSelections({...selections, genero: g}); handleNext(); }}
                      className="btn-shiny py-6 rounded-2xl text-lg font-bold uppercase tracking-widest hover:scale-105 transition-transform"
                    >
                      {g.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Paso 2: Raza */}
            {step === 2 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <h2 className="text-3xl font-bold text-gradient mb-4">Elige tu linaje</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                  {RAZAS.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => { setSelections({...selections, raza: r}); handleNext(); }}
                      className={`p-6 rounded-2xl border transition-all text-left group ${selections.raza.id === r.id ? 'border-primary bg-primary/5' : 'border-border bg-card/50 hover:border-primary/50'}`}
                    >
                      <h3 className="font-bold text-primary text-xl mb-2 group-hover:text-gradient">{r.nombre}</h3>
                      <p className="text-sm text-foreground/60 leading-relaxed">{r.lore}</p>
                    </button>
                  ))}
                </div>
                <button onClick={handleBack} className="mt-8 text-foreground/40 hover:text-primary transition-colors uppercase text-xs font-bold tracking-widest">← Volver</button>
              </div>
            )}

            {/* Paso 3: Clase */}
            {step === 3 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <h2 className="text-3xl font-bold text-gradient mb-4">Tu vocación oculta</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                  {CLASES.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => { setSelections({...selections, clase: c}); handleNext(); }}
                      className={`p-6 rounded-2xl border transition-all text-left group ${selections.clase.id === c.id ? 'border-secondary bg-secondary/5' : 'border-border bg-card/50 hover:border-secondary/50'}`}
                    >
                      <h3 className="font-bold text-secondary text-xl mb-1 group-hover:text-gradient">{c.nombre}</h3>
                      <p className="text-xs text-secondary/60 mb-3 font-mono">
                        {Object.entries(c.bonificadores).filter(([_,v]) => v !== 0).map(([k,v]) => `${k.toUpperCase()} ${v > 0 ? '+' : ''}${v}`).join(" | ")}
                      </p>
                      <p className="text-sm text-foreground/60 leading-relaxed">{c.lore}</p>
                    </button>
                  ))}
                </div>
                <button onClick={handleBack} className="mt-8 text-foreground/40 hover:text-primary transition-colors uppercase text-xs font-bold tracking-widest">← Volver</button>
              </div>
            )}

            {/* Paso 4: Trasfondo */}
            {step === 4 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <h2 className="text-3xl font-bold text-gradient mb-4">Ecos del pasado</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                  {TRASFONDOS.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => { setSelections({...selections, trasfondo: t}); handleNext(); }}
                      className={`p-6 rounded-2xl border transition-all text-left group ${selections.trasfondo.id === t.id ? 'border-accent bg-accent/5' : 'border-border bg-card/50 hover:border-accent/50'}`}
                    >
                      <h3 className="font-bold text-accent text-xl mb-2 group-hover:text-gradient">{t.nombre}</h3>
                      <p className="text-sm text-foreground/60 leading-relaxed">{t.lore}</p>
                    </button>
                  ))}
                </div>
                <button onClick={handleBack} className="mt-8 text-foreground/40 hover:text-primary transition-colors uppercase text-xs font-bold tracking-widest">← Volver</button>
              </div>
            )}

            {/* Paso 5: Nombre (Manual) */}
            {step === 5 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500 text-center">
                <h2 className="text-3xl font-bold text-gradient mb-4">¿Cómo te recordarán las leyendas?</h2>
                <div className="mt-12 max-w-sm mx-auto flex flex-col gap-6">
                  <div className="relative group">
                    <input 
                      type="text"
                      autoFocus
                      placeholder="Escribe tu nombre..."
                      value={selections.nombre}
                      maxLength={8}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSelections({...selections, nombre: val});
                        validateName(val);
                      }}
                      className={`w-full bg-background/50 border-2 rounded-2xl px-6 py-4 text-center text-2xl font-bold tracking-widest outline-none transition-all ${nameError ? 'border-accent/50 text-accent shadow-[0_0_15px_rgba(255,64,64,0.2)]' : 'border-border focus:border-primary focus:shadow-[0_0_20px_rgba(64,230,255,0.2)] text-primary'}`}
                    />
                    {nameError && (
                      <p className="mt-4 text-xs font-bold text-accent uppercase tracking-tighter animate-bounce">
                        {nameError}
                      </p>
                    )}
                  </div>
                  
                  <button
                    disabled={!validateName(selections.nombre)}
                    onClick={() => { fetchNemesis(selections.trasfondo.lore); handleNext(); }}
                    className={`btn-shiny py-5 rounded-2xl text-xl font-bold tracking-widest transition-all ${!validateName(selections.nombre) ? 'opacity-20 grayscale pointer-events-none' : 'opacity-100'}`}
                  >
                    CONTINUAR
                  </button>
                </div>
                <button onClick={handleBack} className="mt-12 text-foreground/40 hover:text-primary transition-colors uppercase text-xs font-bold tracking-widest block mx-auto">← Volver</button>
              </div>
            )}

            {/* Paso 6: Némesis (IA) */}
            {step === 6 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500 text-center">
                <h2 className="text-3xl font-bold text-accent mb-4 animate-pulse">Tu destino está marcado...</h2>
                <p className="text-foreground/60 text-sm mb-12">¿Quién fue el arquitecto de tu desgracia?</p>
                <div className="grid grid-cols-1 gap-4 mt-8 max-w-md mx-auto">
                  {suggestions.map((enemy) => (
                    <button
                      key={enemy}
                      onClick={() => { setSelections({...selections, nemesis: enemy}); }}
                      className={`p-6 rounded-2xl border transition-all ${selections.nemesis === enemy ? 'border-accent bg-accent/10 scale-105' : 'border-border bg-card/50 hover:border-accent/50'}`}
                    >
                      <h3 className="font-bold text-accent text-lg">{enemy}</h3>
                    </button>
                  ))}
                </div>
                
                {selections.nemesis && (
                  <button 
                    onClick={finalizeCreation}
                    className="mt-12 btn-shiny px-12 py-4 rounded-full text-xl font-black text-accent border-accent/30 animate-bounce"
                  >
                    ENFRENTAR MI DESTINO
                  </button>
                )}
                
                <button onClick={handleBack} className="mt-8 text-foreground/40 hover:text-primary transition-colors uppercase text-xs font-bold tracking-widest block mx-auto">← Volver</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
