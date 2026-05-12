"use client";

import React, { useState, useEffect } from 'react';
import { RAZAS, CLASES, TRASFONDOS, ELEMENTOS } from '@/data/compendium';
import { Genero, Personaje } from '@/types/game';
import { sugerirNombres, sugerirNemesis, generarTrasfondosIA } from '@/lib/api-client';
import { db, auth } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

const COLORS = [
  { id: 'crimson', nombre: 'Carmesí', prompt: 'crimson and obsidian' },
  { id: 'azure', nombre: 'Azur', prompt: 'azure and silver' },
  { id: 'emerald', nombre: 'Esmeralda', prompt: 'emerald and bronze' },
  { id: 'void', nombre: 'Vacío', prompt: 'void black and deep purple' },
  { id: 'golden', nombre: 'Dorado', prompt: 'golden and white ivory' },
];

const ACCESSORIES = [
  { id: 'collar_telepatia', nombre: 'Collar de Telepatía', prompt: 'a glowing runic telepathy necklace' },
  { id: 'broken_shackles', nombre: 'Grilletes Rotos', prompt: 'heavy broken iron shackles on wrists' },
  { id: 'runic_ring', nombre: 'Anillo Rúnico', prompt: 'a large glowing runic ring' },
  { id: 'ancient_map', nombre: 'Mapa Antiguo', prompt: 'an ancient weathered scroll case' },
];

export default function CharacterCreator() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selections, setSelections] = useState({
    genero: '' as Genero,
    raza: RAZAS[0],
    clase: CLASES[0],
    color: COLORS[0],
    accesorio: ACCESSORIES[0],
    trasfondo: TRASFONDOS[0],
    nombre: '',
    nemesis: ''
  });

  const [nameOptions, setNameOptions] = useState<string[]>([]);
  const [nemesisOptions, setNemesisOptions] = useState<string[]>([]);
  const [extraTrasfondos, setExtraTrasfondos] = useState<{id: string, nombre: string, lore: string}[]>([]);

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  // Cargar nombres sugeridos cuando se elige raza y género
  useEffect(() => {
    if (step === 5 && selections.genero && selections.raza) {
      setLoading(true);
      sugerirNombres(selections.genero, selections.raza.nombre).then(names => {
        setNameOptions(names);
        setLoading(false);
      });
    }
  }, [step, selections.genero, selections.raza]);

  // Cargar némesis cuando se llega al paso final
  useEffect(() => {
    if (step === 7 && selections.trasfondo) {
      setLoading(true);
      sugerirNemesis(selections.trasfondo.lore).then(enemies => {
        setNemesisOptions(enemies);
        setLoading(false);
      });
    }
  }, [step, selections.trasfondo]);

  const finalizeCreation = async () => {
    if (!auth.currentUser) return;
    setLoading(true);

    const characterId = crypto.randomUUID();
    const gameId = crypto.randomUUID();

    const visual_prompt = `RPG portrait style, dark fantasy, highly detailed, oil painting texture, professional character design, a ${selections.genero} ${selections.raza.nombre} ${selections.clase.nombre}, wearing ${selections.color.prompt} clothes, carrying ${selections.accesorio.prompt}, solid dark background, centered composition, dramatic lighting. The character must hold their sword or main weapon strictly in the right hand, and their shield or secondary item strictly in the left hand, maintaining strict visual consistency.`;

    const narrative_context = `Héroe: ${selections.nombre}. Raza: ${selections.raza.nombre}. Clase: ${selections.clase.nombre}. Estética: ${selections.color.nombre}. Objeto Único: ${selections.accesorio.nombre}. Trasfondo: ${selections.trasfondo.nombre} (${selections.trasfondo.lore}). Némesis: ${selections.nemesis}.`;

    const initialAccessory = {
      id: selections.accesorio.id,
      nombre: selections.accesorio.nombre,
      lore: "Un objeto único que te define.",
      tipo: "accesorio" as const,
      slot: "accesorio" as const,
      bonificadores: {},
      equipado: true
    };

    try {
      // 1. Guardar en la colección global 'jugador' para persistencia de perfil
      await setDoc(doc(db, "jugador", auth.currentUser.uid), {
        uid: auth.currentUser.uid,
        personajeActivoId: characterId,
        narrative_context,
        visual_prompt,
        timestamp: Date.now()
      });

      // 2. Guardar Personaje
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
        mpActual: 20,
        mpMax: 20,
        atributos: { 
          fuerza: 10 + selections.clase.bonificadores.fuerza, 
          agilidad: 10 + selections.clase.bonificadores.agilidad, 
          inteligencia: 10 + selections.clase.bonificadores.inteligencia 
        },
        inventario: [initialAccessory],
        equipamiento: {
          accesorio: initialAccessory
        },
        nivel: 1,
        experiencia: 0,
        xpNecesaria: 100,
        karma: 0,
        status_effects: [],
        visual_prompt,
        narrative_context
      });

      // 3. Guardar Partida (Fase Prólogo)
      await setDoc(doc(db, "partidas", gameId), {
        id: gameId,
        personajeId: characterId,
        grupo: [],
        aliados_desbloqueados: [],
        faseJuego: "prologo",
        ultimaNarrativa: { narrativa: "Despiertas en un mundo que ya no reconoces...", opciones: [] },
        combateLog: [],
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
    <div className="max-w-4xl w-full bg-card/80 backdrop-blur-xl border border-border rounded-3xl p-8 shadow-2xl relative z-10">
      {/* Progress Bar */}
      <div className="w-full h-1 bg-border/30 rounded-full mb-8 overflow-hidden">
        <div 
          className="h-full bg-primary transition-all duration-500 shadow-[0_0_10px_rgba(64,230,255,0.5)]" 
          style={{ width: `${(step / 7) * 100}%` }}
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-primary font-mono animate-pulse uppercase tracking-widest">Canalizando el destino...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* STEP 1: GENDER */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-8">1. Naturaleza del Alma</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(["hombre", "mujer", "no_binario"] as const).map((g) => (
                  <button
                    key={g}
                    onClick={() => { setSelections({...selections, genero: g}); handleNext(); }}
                    className="btn-shiny py-8 rounded-2xl text-lg font-bold uppercase tracking-widest"
                  >
                    {g.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: RACE */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-8">2. Linaje Ancestral</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {RAZAS.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => { setSelections({...selections, raza: r}); handleNext(); }}
                    className={`p-6 rounded-2xl border transition-all text-left group ${selections.raza.id === r.id ? 'border-primary bg-primary/5 shadow-[0_0_20px_rgba(64,230,255,0.1)]' : 'border-white/5 bg-white/5 hover:border-primary/50'}`}
                  >
                    <h3 className="font-bold text-primary text-xl mb-1">{r.nombre}</h3>
                    <p className="text-xs text-white/40 leading-relaxed">{r.lore}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: CLASS */}
          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-8">3. Vocación de Combate</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {CLASES.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => { setSelections({...selections, clase: c}); handleNext(); }}
                    className={`p-6 rounded-2xl border transition-all text-left group ${selections.clase.id === c.id ? 'border-secondary bg-secondary/5 shadow-[0_0_20px_rgba(255,64,255,0.1)]' : 'border-white/5 bg-white/5 hover:border-secondary/50'}`}
                  >
                    <h3 className="font-bold text-secondary text-xl mb-1">{c.nombre}</h3>
                    <p className="text-xs text-white/40 leading-relaxed">{c.lore}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: COLOR & ACCESSORY */}
          {step === 4 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-12">
              <div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-6">4a. Esencia Visual</h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {COLORS.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelections({...selections, color: c})}
                      className={`py-4 rounded-xl border text-xs font-bold uppercase transition-all ${selections.color.id === c.id ? 'border-primary bg-primary/20' : 'border-white/5 bg-white/5'}`}
                    >
                      {c.nombre}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-6">4b. Reliquia Inicial</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ACCESSORIES.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => setSelections({...selections, accesorio: a})}
                      className={`p-4 rounded-xl border text-left transition-all ${selections.accesorio.id === a.id ? 'border-accent bg-accent/10' : 'border-white/5 bg-white/5'}`}
                    >
                      <span className="font-bold text-accent text-sm uppercase block mb-1">{a.nombre}</span>
                      <p className="text-[10px] text-white/30 italic">Un objeto que definirá tu interacción con el mundo.</p>
                    </button>
                  ))}
                </div>
              </div>
              
              <button onClick={handleNext} className="w-full btn-shiny py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-primary">Confirmar Estética</button>
            </div>
          )}

          {/* STEP 5: NAME (BUTTON BASED) */}
          {step === 5 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500 text-center">
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">5. Nombre en la Leyenda</h2>
              <p className="text-white/40 text-sm mb-12 uppercase tracking-widest">Selecciona cómo serás invocado</p>
              <div className="grid grid-cols-1 gap-4 max-w-sm mx-auto">
                {nameOptions.map((name) => (
                  <button
                    key={name}
                    onClick={() => { setSelections({...selections, nombre: name}); handleNext(); }}
                    className="btn-shiny py-6 rounded-2xl text-2xl font-black tracking-widest hover:scale-105 transition-transform"
                  >
                    {name}
                  </button>
                ))}
                <button 
                  onClick={() => sugerirNombres(selections.genero, selections.raza.nombre).then(setNameOptions)}
                  className="mt-4 text-[10px] font-black text-primary/40 hover:text-primary uppercase tracking-[0.2em] transition-colors"
                >
                  ↻ Reroll Nombres
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: TRASFONDO */}
          {step === 6 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-8">6. Ecos del Pasado</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...TRASFONDOS, ...extraTrasfondos].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => { setSelections({...selections, trasfondo: t}); handleNext(); }}
                    className={`p-6 rounded-2xl border transition-all text-left group ${selections.trasfondo.id === t.id ? 'border-accent bg-accent/5' : 'border-white/5 bg-white/5 hover:border-accent/50'}`}
                  >
                    <h3 className="font-bold text-accent text-xl mb-1">{t.nombre}</h3>
                    <p className="text-xs text-white/40 leading-relaxed">{t.lore}</p>
                  </button>
                ))}
                <button
                  onClick={async () => {
                    setLoading(true);
                    const extras = await generarTrasfondosIA();
                    setExtraTrasfondos([...extraTrasfondos, ...extras.map(e => ({...e, id: crypto.randomUUID()}))]);
                    setLoading(false);
                  }}
                  className="p-6 rounded-2xl border border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 transition-all flex flex-col items-center justify-center gap-2"
                >
                  <span className="text-2xl">✨</span>
                  <span className="font-bold text-primary text-xs uppercase tracking-widest">Generar Orígenes (IA)</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 7: NEMESIS */}
          {step === 7 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500 text-center">
              <h2 className="text-3xl font-black text-accent uppercase tracking-tighter mb-4 animate-pulse">Tu Némesis</h2>
              <p className="text-white/40 text-sm mb-12 uppercase tracking-widest">¿Quién es el arquitecto de tu desgracia?</p>
              <div className="grid grid-cols-1 gap-4 max-w-md mx-auto mb-12">
                {nemesisOptions.map((n) => (
                  <button
                    key={n}
                    onClick={() => setSelections({...selections, nemesis: n})}
                    className={`p-6 rounded-2xl border transition-all ${selections.nemesis === n ? 'border-accent bg-accent/20 scale-105 shadow-[0_0_30px_rgba(255,64,64,0.2)]' : 'border-white/5 bg-white/5 hover:border-accent/50'}`}
                  >
                    <h3 className="font-bold text-accent text-lg uppercase tracking-tight">{n}</h3>
                  </button>
                ))}
              </div>
              
              {selections.nemesis && (
                <button 
                  onClick={finalizeCreation}
                  className="btn-shiny px-16 py-6 rounded-full text-2xl font-black text-accent border-accent/40 animate-in zoom-in-90 duration-300"
                >
                  ENFRENTAR MI DESTINO
                </button>
              )}
            </div>
          )}

          {/* BACK BUTTON */}
          {step > 1 && (
            <button 
              onClick={handleBack}
              className="mt-8 text-[10px] font-black text-white/20 hover:text-primary transition-colors uppercase tracking-[0.3em] block mx-auto"
            >
              ← Deshacer Paso
            </button>
          )}
        </div>
      )}
    </div>
  );
}
