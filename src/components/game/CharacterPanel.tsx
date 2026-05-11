"use client";

import React from 'react';
import { Personaje } from '@/types/game';

interface Props {
  personaje: Personaje;
}

export const CharacterPanel: React.FC<Props> = ({ personaje }) => {
  const hpPercentage = (personaje.hpActual / personaje.hpMax) * 100;

  return (
    <div className="w-full lg:w-72 bg-card border border-border rounded-2xl p-6 flex flex-col gap-6 sticky top-8">
      {/* Header Personaje */}
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold text-primary tracking-tight uppercase">
          {personaje.nombre}
        </h2>
        <span className="text-xs text-foreground/50 font-mono">
          NIVEL {personaje.nivel} • EXPLORADOR
        </span>
      </div>

      {/* HP Bar */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-xs font-mono">
          <span className="text-foreground/70">PUNTOS DE VIDA</span>
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

      {/* Decorative Shiny Element */}
      <div className="absolute -bottom-1 -right-1 w-20 h-20 bg-primary/5 blur-3xl pointer-events-none" />
    </div>
  );
};
