"use client";

import React, { useState } from 'react';
import { Companero, Personaje, Habilidad } from '@/types/game';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

interface Props {
  personaje: Personaje;
  aliadosDesbloqueados: Companero[];
  grupoActual: Companero[];
  onConfirm: (nuevoGrupo: Companero[]) => void;
  onBack: () => void;
  onUpdatePersonaje: (personaje: Personaje) => void;
}

export const GuildManagement: React.FC<Props> = ({ 
  personaje, 
  aliadosDesbloqueados, 
  grupoActual, 
  onConfirm,
  onBack,
  onUpdatePersonaje
}) => {
  const [equipoActivo, setEquipoActivo] = useState<Companero[]>(grupoActual);
  const [slotSeleccionado, setSlotSeleccionado] = useState<number | null>(null);
  
  // Gestión de Habilidades
  const [habilidadesEquipadas, setHabilidadesEquipadas] = useState<(Habilidad | null)[]>(
    personaje.habilidades_equipadas || [null, null]
  );
  const [slotHabilidadSeleccionado, setSlotHabilidadSeleccionado] = useState<number | null>(null);
  const [isSavingSkills, setIsSavingSkills] = useState(false);

  const handleSelectAliado = (aliado: Companero) => {
    if (slotSeleccionado === null) return;

    // Escalar aliado al nivel del jugador
    const aliadoEscalado = {
      ...aliado,
      hpMax: 20 + (personaje.nivel - 1) * 5,
      hpActual: 20 + (personaje.nivel - 1) * 5
    };

    const nuevoEquipo = [...equipoActivo];
    nuevoEquipo[slotSeleccionado] = aliadoEscalado;
    setEquipoActivo(nuevoEquipo);
    setSlotSeleccionado(null);
  };

  const handleSelectHabilidad = async (skill: Habilidad) => {
    if (slotHabilidadSeleccionado === null) return;

    const nuevasHabilidades = [...habilidadesEquipadas];
    nuevasHabilidades[slotHabilidadSeleccionado] = skill;
    setHabilidadesEquipadas(nuevasHabilidades);
    setSlotHabilidadSeleccionado(null);
  };

  const saveSkillConfig = async () => {
    setIsSavingSkills(true);
    try {
      const charRef = doc(db, "personajes", personaje.id);
      await updateDoc(charRef, {
        habilidades_equipadas: habilidadesEquipadas
      });
      onUpdatePersonaje({ ...personaje, habilidades_equipadas: habilidadesEquipadas });
    } catch (error) {
      console.error("Error saving skill config:", error);
    } finally {
      setIsSavingSkills(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-12 animate-in fade-in duration-500 pb-20">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black text-primary uppercase tracking-widest">Sede del Gremio</h2>
        <p className="text-foreground/40 text-xs font-bold uppercase tracking-[0.2em]">Prepara tu próxima incursión</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* SECCIÓN 1: GESTIÓN DE LA TRÍADA */}
        <div className="space-y-8 bg-card/30 backdrop-blur-sm p-6 rounded-3xl border border-border/50">
          <div className="flex items-center gap-3 border-l-4 border-secondary pl-4">
            <h3 className="text-secondary text-lg font-black uppercase tracking-tighter">Gestión de la Tríada</h3>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {/* El Jugador (Fijo) */}
            <div className="p-4 rounded-2xl border border-primary/30 bg-primary/5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-xl">🛡️</div>
              <div className="flex-1">
                <p className="font-bold text-primary">{personaje.nombre} (TÚ)</p>
                <p className="text-[10px] text-foreground/50 uppercase">{personaje.clase} • LVL {personaje.nivel}</p>
              </div>
            </div>

            {/* Compañeros */}
            {[0, 1].map((idx) => (
              <button
                key={idx}
                onClick={() => setSlotSeleccionado(idx)}
                className={`p-4 rounded-2xl border transition-all flex items-center gap-4 group text-left ${
                  slotSeleccionado === idx 
                    ? 'border-primary bg-primary/10 shadow-[0_0_15px_rgba(64,230,255,0.2)]' 
                    : 'border-border bg-card/50 hover:border-primary/50'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center text-xl">👥</div>
                <div className="flex-1">
                  <p className="font-bold text-foreground group-hover:text-primary transition-colors">
                    {equipoActivo[idx]?.nombre || "Slot Vacío"}
                  </p>
                  <p className="text-[10px] text-foreground/50 uppercase">
                    {equipoActivo[idx] ? `${equipoActivo[idx].clase} • LVL ${personaje.nivel}` : "Haz clic para asignar"}
                  </p>
                </div>
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] text-primary/60 font-bold uppercase tracking-widest">Reserva de Aliados</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
              {aliadosDesbloqueados.map((aliado) => (
                <button
                  key={aliado.id}
                  disabled={slotSeleccionado === null || equipoActivo.some(e => e?.id === aliado.id)}
                  onClick={() => handleSelectAliado(aliado)}
                  className={`p-3 rounded-xl border transition-all text-left flex flex-col gap-0.5 ${
                    equipoActivo.some(e => e?.id === aliado.id)
                      ? 'opacity-40 grayscale border-border bg-black/20 cursor-not-allowed'
                      : slotSeleccionado !== null
                        ? 'border-primary/40 bg-primary/5 hover:border-primary'
                        : 'border-border bg-card/50'
                  }`}
                >
                  <span className="font-bold text-xs">{aliado.nombre}</span>
                  <span className="text-[8px] text-primary/60 uppercase font-bold">{aliado.clase}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* SECCIÓN 2: GESTOR DE HABILIDADES TÁCTICAS */}
        <div className="space-y-8 bg-card/30 backdrop-blur-sm p-6 rounded-3xl border border-border/50">
          <div className="flex items-center gap-3 border-l-4 border-accent pl-4">
            <h3 className="text-accent text-lg font-black uppercase tracking-tighter">Habilidades Tácticas</h3>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <p className="text-[10px] text-foreground/40 uppercase tracking-widest mb-2">Slots Dinámicos (4 y 5)</p>
            <div className="grid grid-cols-2 gap-4">
              {[0, 1].map((idx) => (
                <button
                  key={idx}
                  onClick={() => setSlotHabilidadSeleccionado(idx)}
                  className={`p-4 rounded-2xl border transition-all flex flex-col items-center justify-center gap-2 group text-center aspect-square ${
                    slotHabilidadSeleccionado === idx 
                      ? 'border-accent bg-accent/10 shadow-[0_0_15px_rgba(255,64,64,0.2)]' 
                      : 'border-border bg-card/50 hover:border-accent/50'
                  }`}
                >
                  <span className="text-[10px] text-accent/60 font-bold uppercase tracking-widest">Slot {idx + 4}</span>
                  <span className="font-bold text-sm text-foreground group-hover:text-accent transition-colors">
                    {habilidadesEquipadas[idx]?.nombre || "Vacío"}
                  </span>
                  {habilidadesEquipadas[idx] && (
                    <span className="text-[8px] text-accent font-mono">{habilidadesEquipadas[idx]?.costo_mp} MP</span>
                  )}
                </button>
              ))}
            </div>
            
            <button 
              onClick={saveSkillConfig}
              disabled={isSavingSkills}
              className="w-full text-[10px] font-black text-accent border border-accent/20 bg-accent/5 py-3 rounded-xl hover:bg-accent/10 transition-all uppercase tracking-[0.2em]"
            >
              {isSavingSkills ? "Guardando..." : "Sincronizar Habilidades"}
            </button>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] text-accent/60 font-bold uppercase tracking-widest">Habilidades Desbloqueadas</h4>
            <div className="grid grid-cols-1 gap-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
              {(personaje.habilidades_desbloqueadas || []).map((skill) => (
                <button
                  key={skill.id}
                  disabled={slotHabilidadSeleccionado === null || habilidadesEquipadas.some(s => s?.id === skill.id)}
                  onClick={() => handleSelectHabilidad(skill)}
                  className={`p-4 rounded-xl border transition-all text-left flex justify-between items-center ${
                    habilidadesEquipadas.some(s => s?.id === skill.id)
                      ? 'opacity-40 grayscale border-border bg-black/20 cursor-not-allowed'
                      : slotHabilidadSeleccionado !== null
                        ? 'border-accent/40 bg-accent/5 hover:border-accent'
                        : 'border-border bg-card/50'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="font-bold text-xs uppercase tracking-tight">{skill.nombre}</span>
                    <span className="text-[9px] text-foreground/40 italic line-clamp-1">{skill.descripcion}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-mono text-accent block">{skill.costo_mp} MP</span>
                    <span className="text-[8px] text-foreground/30 uppercase">{skill.tipo}</span>
                  </div>
                </button>
              ))}
              {(!personaje.habilidades_desbloqueadas || personaje.habilidades_desbloqueadas.length === 0) && (
                <div className="py-8 text-center border-2 border-dashed border-border rounded-2xl">
                  <p className="text-foreground/20 text-[10px] font-bold uppercase">No has desbloqueado habilidades aún</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-12">
        <button
          onClick={onBack}
          className="text-[10px] text-foreground/40 hover:text-primary transition-colors uppercase font-bold tracking-widest px-8 py-4"
        >
          Volver a la Taberna
        </button>
        <button
          onClick={() => onConfirm(equipoActivo)}
          disabled={equipoActivo.some(e => !e)}
          className="btn-shiny px-16 py-5 rounded-full font-black text-primary border-primary/30 disabled:opacity-20 text-lg"
        >
          CONFIRMAR EXPEDICIÓN
        </button>
      </div>
    </div>
  );
};
