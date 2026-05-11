export interface Atributos {
  fuerza: number;
  agilidad: number;
  inteligencia: number;
}

export interface Personaje {
  id: string;
  usuarioId: string;
  nombre: string;
  hpActual: number;
  hpMax: number;
  atributos: Atributos;
  inventario: string[];
  nivel: number;
  experiencia: number;
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
  ultimaNarrativa: RespuestaIA;
  timestamp: number;
}
