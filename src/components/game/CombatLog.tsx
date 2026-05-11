"use client";

import React, { useEffect, useRef } from 'react';
import { LogEntry } from '@/types/game';

interface Props {
  logs: LogEntry[];
}

export const CombatLog: React.FC<Props> = ({ logs }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col h-full max-h-[300px]">
      <div className="flex justify-between items-center mb-2 border-b border-white/5 pb-1">
        <span className="text-[10px] font-black text-secondary uppercase tracking-[0.2em]">Registro de Combate</span>
        <div className="flex gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
          <div className="w-1.5 h-1.5 rounded-full bg-secondary/40" />
        </div>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar"
      >
        {logs.length === 0 ? (
          <p className="text-[10px] text-white/20 italic text-center mt-4 uppercase tracking-widest">Esperando acción...</p>
        ) : (
          logs.map((log) => (
            <div 
              key={log.id} 
              className={`text-[11px] font-mono leading-relaxed border-l-2 pl-2 py-0.5 animate-in slide-in-from-left-2 duration-300 ${
                log.tipo === 'combate' ? 'border-accent text-accent/90' :
                log.tipo === 'loot' ? 'border-secondary text-secondary/90' :
                log.tipo === 'critico' ? 'border-yellow-400 text-yellow-400 font-bold shadow-[0_0_10px_rgba(250,204,21,0.3)] animate-pulse' :
                log.tipo === 'sinergia' ? 'border-cyan-400 text-cyan-400 italic' :
                'border-primary text-primary/80'
              }`}
            >
              <span className="opacity-40 mr-1">[{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
              {log.mensaje}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
