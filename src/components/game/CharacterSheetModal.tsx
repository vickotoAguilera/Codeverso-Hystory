"use client";

import React from 'react';
import { Personaje, Companero, SlotEquipamiento, Objeto } from '@/types/game';

interface Props {
  entidad: Personaje | Companero;
  isOpen: boolean;
  onClose: () => void;
  onEquip?: (slot: SlotEquipamiento, objeto: Objeto) => void;
}

export const CharacterSheetModal: React.FC<Props> = ({ entidad, isOpen, onClose, onEquip }) => {
  if (!isOpen) return null;

  const isPlayer = 'usuarioId' in entidad;
  const stats = isPlayer ? (entidad as Personaje).atributos : { fuerza: 10, agilidad: 10, inteligencia: 10 };
  const inventario = isPlayer ? (entidad as Personaje).inventario : [];
  const equipamiento = isPlayer ? (entidad as Personaje).equipamiento : {};

  const slots: { id: SlotEquipamiento, label: string, icon: string }[] = [
    { id: 'cabeza', label: 'Cabeza', icon: '🪖' },
    { id: 'pecho', label: 'Pecho', icon: '🛡️' },
    { id: 'mano_derecha', label: 'Mano Derecha', icon: '⚔️' },
    { id: 'mano_izquierda', label: 'Mano Izquierda', icon: '🛡️' },
    { id: 'accesorio', label: 'Accesorio', icon: '💍' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="bg-card/90 border border-white/10 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-primary/10 to-transparent">
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-widest">{entidad.nombre}</h2>
            <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">{entidad.clase} • Nivel {isPlayer ? (entidad as Personaje).nivel : '?'}</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Stats & Equipment Slots */}
          <div className="space-y-8">
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(stats).map(([key, val]) => (
                <div key={key} className="bg-black/40 border border-white/5 rounded-2xl p-4 text-center group hover:border-primary/30 transition-all">
                  <p className="text-[10px] font-black text-white/40 uppercase mb-1 tracking-widest">{key}</p>
                  <p className="text-2xl font-black text-primary">{val as React.ReactNode}</p>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-black text-white/60 uppercase tracking-[0.2em] border-l-2 border-primary pl-3">Equipamiento</h3>
              <div className="grid grid-cols-1 gap-3">
                {slots.map((slot) => {
                  const item = equipamiento[slot.id];
                  return (
                    <div key={slot.id} className="flex items-center gap-4 bg-white/5 p-3 rounded-2xl border border-white/5 group hover:bg-white/10 transition-all">
                      <div className="w-12 h-12 rounded-xl bg-black/60 flex items-center justify-center text-2xl border border-white/10">
                        {item ? '🎁' : slot.icon}
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">{slot.label}</p>
                        <p className="font-bold text-sm">{item?.nombre || 'Vacío'}</p>
                      </div>
                      {item && (
                        <div className="flex gap-2">
                          {Object.entries(item.bonificadores).map(([s, v]) => (
                            <span key={s} className="text-[9px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-bold">
                              {s[0].toUpperCase()}+{v as React.ReactNode}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Inventory / Bag */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-white/60 uppercase tracking-[0.2em] border-l-2 border-secondary pl-3">Mochila</h3>
            <div className="grid grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {inventario.length === 0 ? (
                <div className="col-span-2 py-20 text-center opacity-20 uppercase text-xs font-black tracking-widest">Inventario Vacío</div>
              ) : (
                inventario.map((item) => (
                  <button 
                    key={item.id}
                    onClick={() => {
                      if ((item as any).subtipo === "revestimiento") {
                        // Invocamos la acción de aplicar revestimiento (debe ser pasada como prop o manejada en el padre)
                        console.log("Usando revestimiento:", item.nombre);
                      } else if (item.slot) {
                        onEquip?.(item.slot, item);
                      }
                    }}
                    className="p-4 rounded-2xl bg-white/5 border border-white/5 text-left group hover:border-secondary/50 hover:bg-white/10 transition-all"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[8px] font-black bg-secondary/20 text-secondary px-1.5 py-0.5 rounded uppercase">{item.tipo}</span>
                      <span className="text-xl">🎁</span>
                    </div>
                    <p className="font-bold text-sm mb-1 group-hover:text-secondary transition-colors">{item.nombre}</p>
                    <p className="text-[9px] text-white/40 leading-tight line-clamp-2">{item.lore}</p>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
