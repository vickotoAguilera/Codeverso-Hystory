export interface Atributos {
  fuerza: number;
  agilidad: number;
  inteligencia: number;
}

export type Elemento = "Fuego" | "Agua" | "Viento" | "Tierra" | "Físico";

export interface StatusEffect {
  id: string;
  tipo: "DOT_QUEMADURA" | "DOT_SANGRADO" | "DOT_VENENO" | "HOT_REGENERACION" | "HOT_ETER";
  duracion: number;
  valor: number;
  es_mp?: boolean;
}

export interface Habilidad {
  id: string;
  nombre: string;
  tipo: "Habilidad Fisica" | "Magia Negra" | "Magia Blanca" | "Habilidad Defensa";
  descripcion: string;
  costo_mp: number;
  poder: number;
  alcance: "Un Enemigo" | "Todos Enemigos" | "Un Aliado" | "Todos Aliados" | "Usuario";
  elemento: Elemento;
  efecto?: StatusEffect["tipo"] | null;
  dot_duracion?: number;
  dot_dano?: number;
  hot_duracion?: number;
  hot_curacion?: number;
  hot_mp?: number;
}

export interface EntidadTurno {
  id: string;
  nombre: string;
  tipo: "heroe" | "enemigo";
  iniciativa: number;
  velocidad: number;
  status_effects: StatusEffect[];
}

export type Genero = "hombre" | "mujer" | "no_binario";
export type FaseJuego = "prologo" | "llegada_gremio" | "aventura";

export interface Companero {
  id: string;
  nombre: string;
  clase: string;
  hpMax: number;
  hpActual: number;
  mpMax: number;
  mpActual: number;
  actitud?: string;
  retrato?: string;
  status_effects: StatusEffect[];
}

export type SlotEquipamiento = "cabeza" | "pecho" | "mano_derecha" | "mano_izquierda" | "accesorio";

export interface Objeto {
  id: string;
  nombre: string;
  lore: string;
  tipo: "arma" | "armadura" | "accesorio" | "consumible";
  slot?: SlotEquipamiento;
  bonificadores: Partial<Atributos>;
  equipado?: boolean;
}

export interface Personaje {
  id: string;
  usuarioId: string;
  nombre: string;
  genero: Genero;
  raza: string;
  clase: string;
  trasfondo: string;
  nemesis: string;
  hpActual: number;
  hpMax: number;
  mpActual: number;
  mpMax: number;
  atributos: Atributos;
  inventario: Objeto[];
  equipamiento: Partial<Record<SlotEquipamiento, Objeto>>;
  nivel: number;
  experiencia: number;
  xpNecesaria: number;
  karma: number;
  retrato?: string;
  visual_prompt?: string;
  narrative_context?: string;
  status_effects: StatusEffect[];
  habilidades_desbloqueadas?: Habilidad[];
}

export interface Enemigo {
  id: string;
  nombre: string;
  hpMax: number;
  hpActual: number;
  mpMax: number;
  mpActual: number;
  retrato?: string;
  habilidades: Habilidad[];
  status_effects: StatusEffect[];
  velocidad: number;
}

export interface OpcionNarrativa {
  id: number;
  texto_boton: string;
  tipo_accion: "narrativa" | "combate" | "dialogo" | "movimiento" | "habilidad";
  atributo_requerido?: keyof Atributos;
  habilidad_id?: string;
}

export interface RespuestaIA {
  narrativa: string;
  opciones: OpcionNarrativa[];
  nueva_ubicacion?: string;
  cambio_karma?: number;
  loot?: Objeto[];
  nuevo_aliado?: Partial<Companero> & { lore_breve: string };
  enemigos?: Enemigo[];
}

export interface LogEntry {
  id: string;
  tipo: "combate" | "sistema" | "loot";
  mensaje: string;
  timestamp: number;
  isCritical?: boolean;
}

export interface Partida {
  id: string;
  personajeId: string;
  grupo: Companero[];
  faseJuego: FaseJuego;
  ultimaNarrativa: RespuestaIA;
  ubicacion_actual?: string;
  punto_control_actual?: string;
  nivel_objetivo?: number;
  velocidad_xp?: number;
  aliados_desbloqueados: Companero[];
  combateLog: LogEntry[];
  timestamp: number;
}
