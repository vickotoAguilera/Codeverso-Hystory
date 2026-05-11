"use client";

import React, { useState } from 'react';
import { Companero, Personaje } from '@/types/game';

interface Props {
  personaje: Personaje;
  aliadosDesbloqueados: Companero[];
  grupoActual: Companero[];
  onConfirm: (nuevoGrupo: Companero[]) => void;
  onBack: () => void;
}

export const GuildManagement: React.FC<Props> = ({ 
  personaje, 
  aliadosDesbloqueados, 
  grupoActual, 
  onConfirm,
  onBack
}) => {
  const [equipoActivo, setEquipoActivo] = useState<Companero[]>(grupoActual);
  const [slotSeleccionado, setSlotSeleccionado] = useState<number | null>(null);

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

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-8 animate-in fade-in duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black text-primary uppercase tracking-widest">Gestión de la Tríada</h2>
        <p className="text-foreground/40 text-xs font-bold uppercase tracking-[0.2em]">Configura tu equipo para la expedición</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Equipo Activo */}
        <div className="space-y-6">
          <h3 className="text-secondary text-xs font-bold uppercase tracking-widest px-4 border-l-2 border-secondary">Equipo Actual</h3>
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
                {slotSeleccionado === idx && (
                  <span className="text-[10px] text-primary animate-pulse font-bold">SELECCIONANDO...</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Reserva de Aliados */}
        <div className="space-y-6">
          <h3 className="text-primary text-xs font-bold uppercase tracking-widest px-4 border-l-2 border-primary">Aliados en Reserva</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {aliadosDesbloqueados.map((aliado) => (
              <button
                key={aliado.id}
                disabled={slotSeleccionado === null || equipoActivo.some(e => e?.id === aliado.id)}
                onClick={() => handleSelectAliado(aliado)}
                className={`p-4 rounded-2xl border transition-all text-left flex flex-col gap-1 ${
                  equipoActivo.some(e => e?.id === aliado.id)
                    ? 'opacity-40 grayscale border-border bg-black/20 cursor-not-allowed'
                    : slotSeleccionado !== null
                      ? 'border-primary/40 bg-primary/5 hover:border-primary hover:scale-[1.02]'
                      : 'border-border bg-card/50'
                }`}
              >
                <span className="font-bold text-sm">{aliado.nombre}</span>
                <span className="text-[9px] text-primary/60 uppercase font-bold">{aliado.clase}</span>
                <span className="text-[9px] text-foreground/40 italic line-clamp-1">{aliado.actitud}</span>
              </button>
            ))}
            {aliadosDesbloqueados.length === 0 && (
              <div className="col-span-full py-12 text-center border-2 border-dashed border-border rounded-3xl">
                <p className="text-foreground/20 text-xs font-bold uppercase">No hay aliados en reserva</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
        <button
          onClick={onBack}
          className="text-[10px] text-foreground/40 hover:text-primary transition-colors uppercase font-bold tracking-widest px-8 py-4"
        >
          Cancelar
        </button>
        <button
          onClick={() => onConfirm(equipoActivo)}
          disabled={equipoActivo.some(e => !e)}
          className="btn-shiny px-12 py-4 rounded-full font-black text-primary border-primary/30 disabled:opacity-20"
        >
          CONFIRMAR FORMACIÓN Y VOLVER
        </button>
      </div>
    </div>
  );
};
