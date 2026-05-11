"use client";

import React, { useEffect } from 'react';
import { Enemigo } from '@/types/game';
import { generateAndStorePortrait } from '@/actions/visuals';
import Image from 'next/image';

interface Props {
  enemigos: Enemigo[];
}

export const EnemyPanel: React.FC<Props> = ({ enemigos }) => {
  useEffect(() => {
    enemigos.forEach(enemigo => {
      if (!enemigo.retrato) {
        generateAndStorePortrait(enemigo.id, "enemigos", `A terrifying ${enemigo.nombre} monster`);
      }
    });
  }, [enemigos]);

  if (!enemigos || enemigos.length === 0) {
    return (
      <div className="bg-card/30 backdrop-blur-md border border-white/5 rounded-3xl p-8 flex flex-col items-center justify-center h-full min-h-[400px] group">
        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
          <span className="text-3xl grayscale opacity-20">💀</span>
        </div>
        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] text-center">Sin Amenazas Detectadas</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center gap-3 mb-2 px-2">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-accent/30" />
        <span className="text-[10px] font-black text-accent uppercase tracking-[0.3em]">Encuentro Hostil</span>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-accent/30" />
      </div>

      <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
        {enemigos.map((enemigo) => (
          <div 
            key={enemigo.id}
            className="bg-card/50 backdrop-blur-xl border border-accent/20 rounded-2xl p-4 relative overflow-hidden group hover:border-accent/40 transition-all duration-300"
          >
            {/* HP Bar Background Decor */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-accent/10 transition-colors" />
            
            <div className="flex gap-4 items-center relative z-10">
              <div className="relative">
                <div className="w-16 h-16 rounded-xl bg-black/40 border border-accent/30 overflow-hidden flex items-center justify-center shadow-lg relative">
                  {enemigo.retrato ? (
                    <Image 
                      src={enemigo.retrato} 
                      alt={enemigo.nombre} 
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-2xl">👺</span>
                      <div className="w-8 h-0.5 bg-accent/20 overflow-hidden rounded-full">
                        <div className="h-full bg-accent animate-progress-fast" />
                      </div>
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 bg-accent text-black text-[8px] font-black px-1 rounded border border-black">
                  LVL ?
                </div>
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex justify-between items-end">
                  <h4 className="text-sm font-black text-white uppercase tracking-tighter">{enemigo.nombre}</h4>
                  <span className="text-[10px] font-mono text-accent">{enemigo.hpActual}/{enemigo.hpMax} HP</span>
                </div>
                
                {/* HP Bar */}
                <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                  <div 
                    className="h-full bg-gradient-to-r from-accent to-red-500 transition-all duration-500"
                    style={{ width: `${(enemigo.hpActual / enemigo.hpMax) * 100}%` }}
                  />
                </div>

                {/* MP Bar */}
                <div className="h-1 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
                    style={{ width: `${(enemigo.mpActual / enemigo.mpMax) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
