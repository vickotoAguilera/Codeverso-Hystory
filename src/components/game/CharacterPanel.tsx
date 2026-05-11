"use client";

import React from 'react';
import { Personaje, Companero } from '@/types/game';

interface Props {
  personaje: Personaje;
  grupo?: Companero[];
}

export const CharacterPanel: React.FC<Props> = ({ personaje, grupo = [] }) => {
  const hpPercentage = (personaje.hpActual / personaje.hpMax) * 100;
  const xpPercentage = (personaje.experiencia / (personaje.xpNecesaria || 100)) * 100;

  return (
    <div className="w-full lg:w-72 bg-card border border-border rounded-2xl p-6 flex flex-col gap-6 sticky top-8">
      {/* Header Personaje */}
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold text-primary tracking-tight uppercase">
          {personaje.nombre}
        </h2>
        <div className="flex justify-between items-center">
          <span className="text-[10px] text-foreground/50 font-mono">
            {personaje.genero.toUpperCase()} • {personaje.raza.toUpperCase()}
          </span>
          <span className="text-xs font-black text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
            NIVEL {personaje.nivel}
          </span>
        </div>
      </div>

      {/* HP Bar Jugador */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-[10px] font-mono">
          <span className="text-foreground/70 uppercase tracking-widest">Vitalidad</span>
          <span className={personaje.hpActual < 5 ? 'text-accent animate-pulse' : 'text-primary'}>
            {personaje.hpActual} / {personaje.hpMax}
          </span>
        </div>
        <div className="h-2 w-full bg-border rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-accent to-primary transition-all duration-500 ease-out"
            style={{ width: `${hpPercentage}%` }}
          />
        </div>
      </div>

      {/* XP Bar Jugador */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-[10px] font-mono">
          <span className="text-foreground/70 uppercase tracking-widest text-[9px]">Experiencia</span>
          <span className="text-secondary">
            {personaje.experiencia} / {personaje.xpNecesaria || 100}
          </span>
        </div>
        <div className="h-1 w-full bg-border/50 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-secondary to-primary animate-shiny transition-all duration-500 ease-out"
            style={{ width: `${xpPercentage}%` }}
          />
        </div>
      </div>

      {/* Atributos */}
      <div className="grid grid-cols-1 gap-3">
        <div className="flex justify-between items-center p-3 rounded-xl bg-background/50 border border-border/50 hover:border-primary/30 transition-colors">
          <span className="text-xs text-foreground/60 uppercase tracking-widest">Fuerza</span>
          <span className="text-lg font-bold text-primary">{personaje.atributos.fuerza}</span>
        </div>
        <div className="flex justify-between items-center p-3 rounded-xl bg-background/50 border border-border/50 hover:border-secondary/30 transition-colors">
          <span className="text-xs text-foreground/60 uppercase tracking-widest">Agilidad</span>
          <span className="text-lg font-bold text-secondary">{personaje.atributos.agilidad}</span>
        </div>
        <div className="flex justify-between items-center p-3 rounded-xl bg-background/50 border border-border/50 hover:border-accent/30 transition-colors">
          <span className="text-xs text-foreground/60 uppercase tracking-widest">Inteligencia</span>
          <span className="text-lg font-bold text-accent">{personaje.atributos.inteligencia}</span>
        </div>
      </div>

      {/* Grupo */}
      {grupo.length > 0 && (
        <div className="flex flex-col gap-4 pt-4 border-t border-border/50">
          <h3 className="text-xs font-bold text-foreground/40 uppercase tracking-widest">Grupo</h3>
          {grupo.map((miembro) => (
            <div key={miembro.id} className="flex flex-col gap-1.5">
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-foreground/80">{miembro.nombre} <span className="text-foreground/40 text-[9px]">({miembro.clase.split('_')[0]})</span></span>
                <span className="text-primary/70">{miembro.hpActual}/{miembro.hpMax}</span>
              </div>
              <div className="h-1 w-full bg-border/50 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary/60 transition-all duration-500"
                  style={{ width: `${(miembro.hpActual / miembro.hpMax) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Inventario */}
      <div className="flex flex-col gap-3">
        <h3 className="text-xs font-bold text-foreground/40 uppercase tracking-widest">Inventario</h3>
        <div className="flex flex-wrap gap-2">
          {personaje.inventario.length > 0 ? (
            personaje.inventario.map((item, idx) => (
              <span key={idx} className="px-3 py-1 rounded-full bg-border/30 border border-border text-[10px] uppercase font-bold text-foreground/80">
                {item}
              </span>
            ))
          ) : (
            <span className="text-[10px] text-foreground/30 italic">Inventario vacío...</span>
          )}
        </div>
      </div>
    </div>
  );
};
