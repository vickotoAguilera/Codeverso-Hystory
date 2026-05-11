export interface Atributos {
  fuerza: number;
  agilidad: number;
  inteligencia: number;
}

export type Genero = "hombre" | "mujer" | "no_binario";
export type FaseJuego = "prologo" | "llegada_gremio" | "aventura";

export interface Companero {
  id: string;
  nombre: string;
  clase: "guerrero_tanque" | "clerigo_soporte";
  hpMax: number;
  hpActual: number;
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
  atributos: Atributos;
  inventario: string[];
  nivel: number;
  experiencia: number;
  xpNecesaria: number;
}

export interface OpcionNarrativa {
  id: number;
  texto_boton: string;
  tipo_accion: "narrativa" | "combate" | "dialogo" | "movimiento";
  atributo_requerido?: keyof Atributos;
}

export interface RespuestaIA {
  narrativa: string;
  opciones: OpcionNarrativa[];
}

export interface Partida {
  id: string;
  personajeId: string;
  grupo: Companero[];
  faseJuego: FaseJuego;
  ultimaNarrativa: RespuestaIA;
  timestamp: number;
}
