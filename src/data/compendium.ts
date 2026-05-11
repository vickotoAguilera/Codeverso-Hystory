export interface Raza {
  id: string;
  nombre: string;
  lore: string;
}

export interface Clase {
  id: string;
  nombre: string;
  lore: string;
  bonificadores: {
    fuerza: number;
    agilidad: number;
    inteligencia: number;
  };
}

export interface Trasfondo {
  id: string;
  nombre: string;
  lore: string;
}

export const RAZAS: Raza[] = [
  {
    id: "drakonico",
    nombre: "Drakónico",
    lore: "Descendientes de los wyrms de antaño, poseen escamas duras y un aliento elemental latente que vibra en su sangre."
  },
  {
    id: "enano",
    nombre: "Enano de las Profundidades",
    lore: "Forjadores incansables que han pasado milenios bajo tierra, adaptando su visión y fuerza a la oscuridad eterna."
  },
  {
    id: "humano",
    nombre: "Humano del Páramo",
    lore: "Versátiles y ambiciosos, los humanos han sobrevivido a las catástrofes adaptando su ingenio y voluntad."
  },
  {
    id: "elfo_oscuro",
    nombre: "Elfo Sombrío",
    lore: "Antiguos moradores de los bosques prohibidos, su magia está ligada a los susurros de las sombras y el vacío."
  }
];

export const CLASES: Clase[] = [
  {
    id: "nigromante",
    nombre: "Nigromante",
    lore: "Eruditos de la muerte que manipulan la energía vital y levantan a los caídos para servir a su voluntad.",
    bonificadores: { inteligencia: 5, agilidad: 0, fuerza: -1 }
  },
  {
    id: "guerrero_ceniza",
    nombre: "Guerrero de Ceniza",
    lore: "Combatientes brutales que utilizan la fuerza bruta y armaduras pesadas forjadas en volcanes olvidados.",
    bonificadores: { fuerza: 5, agilidad: -1, inteligencia: 0 }
  },
  {
    id: "acechador",
    nombre: "Acechador Nocturno",
    lore: "Maestros del sigilo y el asesinato, prefieren atacar desde las sombras antes de que el enemigo note su presencia.",
    bonificadores: { agilidad: 5, fuerza: 0, inteligencia: -1 }
  },
  {
    id: "clerigo_sangre",
    nombre: "Clérigo de Sangre",
    lore: "Sacerdotes de deidades oscuras que sacrifican su propia vitalidad para sanar aliados o maldecir enemigos.",
    bonificadores: { inteligencia: 2, fuerza: 2, agilidad: 0 }
  }
];

export const TRASFONDOS: Trasfondo[] = [
  {
    id: "superviviente",
    nombre: "Último Superviviente",
    lore: "Tu pueblo fue arrasado por una plaga sombría. Eres el único que queda y llevas la carga de su memoria."
  },
  {
    id: "renegado",
    nombre: "Renegado de la Orden",
    lore: "Traicionaste a una orden poderosa al descubrir sus secretos oscuros. Ahora eres cazado como un traidor."
  },
  {
    id: "huerfano_guerra",
    nombre: "Huérfano de Guerra",
    lore: "Creciste en las calles de una ciudad en ruinas, aprendiendo a robar y pelear para ver un nuevo amanecer."
  },
  {
    id: "erudito_prohibido",
    nombre: "Erudito Prohibido",
    lore: "Buscaste conocimientos que la mayoría teme, encontrando verdades que han fragmentado tu mente y alma."
  }
];
