import { Habilidad, Elemento } from "@/types/game";

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
  habilidades: Habilidad[];
}

export interface Trasfondo {
  id: string;
  nombre: string;
  lore: string;
}

export const ELEMENTOS: Elemento[] = ["Fuego", "Agua", "Viento", "Tierra", "Físico"];

export const HABILIDADES_BASE: Record<string, Habilidad> = {
  "ID_PIRO": {
    id: "ID_PIRO",
    nombre: "Piro",
    tipo: "Magia Negra",
    descripcion: "Daña a un enemigo con fuego.",
    costo_mp: 5,
    poder: 25,
    alcance: "Un Enemigo",
    elemento: "Fuego",
    efecto: "DOT_QUEMADURA",
    dot_duracion: 3,
    dot_dano: 15
  },
  "ID_VIENTO": {
    id: "ID_VIENTO",
    nombre: "Viento",
    tipo: "Magia Negra",
    descripcion: "Ataca con una ráfaga de viento a un enemigo.",
    costo_mp: 6,
    poder: 22,
    alcance: "Un Enemigo",
    elemento: "Viento"
  },
  "ID_CORTE_CRUZADO": {
    id: "ID_CORTE_CRUZADO",
    nombre: "Corte Cruzado",
    tipo: "Habilidad Fisica",
    descripcion: "Un ataque de espada que golpea con fuerza media.",
    costo_mp: 5,
    poder: 25,
    alcance: "Un Enemigo",
    elemento: "Físico"
  }
};

export const RAZAS: Raza[] = [ 
   { 
     id: "humano_adaptable", 
     nombre: "Humano", 
     lore: "Versátiles y ambiciosos. Su corta esperanza de vida los impulsa a dejar una marca en la historia, sin importar el costo o la moralidad." 
   }, 
   { 
     id: "elfo_umbrio", 
     nombre: "Elfo Umbrío", 
     lore: "Desterrados de los bosques ancestrales, han aprendido a canalizar la magia de las sombras y el engaño para sobrevivir en la oscuridad." 
   }, 
   { 
     id: "enano_profundidades", 
     nombre: "Enano de las Profundidades", 
     lore: "Forjadores implacables. Sus cuerpos están endurecidos por la aplastante presión de las cavernas y la exposición a minerales arcanos radiactivos." 
   }, 
   { 
     id: "drakonico", 
     nombre: "Drakónico", 
     lore: "Descendientes de los wyrms antiguos. Poseen escamas impenetrables y un orgullo que arde tanto como la magia elemental en su sangre." 
   }, 
   { 
     id: "engendro_abismo", 
     nombre: "Engendro del Abismo (Tiefling)", 
     lore: "Llevan la maldición de entidades demoníacas en su linaje. Son temidos y cazados, pero su afinidad natural con lo oculto es inigualable." 
   }, 
   { 
     id: "alma_forjada", 
     nombre: "Alma Forjada (Autómata)", 
     lore: "Cuerpos mecánicos impulsados por cristales de almas atrapadas. No sienten fatiga, pero carecen de la chispa natural de la vida." 
   }, 
   { 
     id: "sangre_lunar", 
     nombre: "Sangre Lunar (Cambiaformas)", 
     lore: "Humanoides con una conexión bestial y salvaje. En combate, sus instintos primarios se agudizan, volviéndolos depredadores letales." 
   }, 
   { 
     id: "vastago_vampirico", 
     nombre: "Vástago de la Noche (Dhampir)", 
     lore: "Caminan entre el mundo de los vivos y los muertos. Poseen una sed insaciable que les otorga reflejos sobrenaturales." 
   }, 
   { 
     id: "orco_hierro", 
     nombre: "Orco de Sangre de Hierro", 
     lore: "Nacidos en tierras desoladas donde solo los más fuertes sobreviven. Su resistencia al dolor roza lo sobrenatural." 
   }, 
   { 
     id: "sylphide_cenizas", 
     nombre: "Sylphide de las Cenizas", 
     lore: "Antiguos espíritus del viento cuyos hogares fueron quemados. Ahora viajan por el mundo portando el rencor de los elementos." 
   } 
 ]; 
 
 export const CLASES: Clase[] = [ 
   // --- TANQUES Y DEFENSORES --- 
   { 
     id: "vanguardia", 
     nombre: "Vanguardia", 
     lore: "Maestros del combate cuerpo a cuerpo y la supervivencia. Utilizan fuerza bruta para aplastar enemigos y proteger a sus aliados.", 
     bonificadores: { fuerza: 4, agilidad: 1, inteligencia: -1 },
     habilidades: [HABILIDADES_BASE["ID_CORTE_CRUZADO"]]
   }, 
   { 
     id: "paladin_ocaso", 
     nombre: "Paladín del Ocaso", 
     lore: "Guerreros sagrados que juraron lealtad a dioses olvidados. Combinan armadura pesada con magia protectora.", 
     bonificadores: { fuerza: 3, agilidad: 0, inteligencia: 1 },
     habilidades: []
   }, 
   { 
     id: "caballero_dragon", 
     nombre: "Caballero Dragón", 
     lore: "Luchadores formidables que imitan las tácticas de las bestias aladas, utilizando lanzas y fuerza bruta para controlar el campo.", 
     bonificadores: { fuerza: 4, agilidad: -1, inteligencia: 1 },
     habilidades: []
   }, 
   { 
     id: "templario_hierro", 
     nombre: "Templario de Hierro", 
     lore: "Bastiones inamovibles. Sacrifican toda agilidad y conocimiento arcano para convertirse en escudos humanos indestructibles.", 
     bonificadores: { fuerza: 5, agilidad: -1, inteligencia: 0 },
     habilidades: []
   }, 
 
   // --- DPS FÍSICOS (AGILIDAD Y FUERZA) --- 
   { 
     id: "sombra", 
     nombre: "Hoja de las Sombras (Asesino)", 
     lore: "Especialistas en la evasión y el daño letal. Atacan los puntos débiles del enemigo antes de que este pueda reaccionar.", 
     bonificadores: { fuerza: 1, agilidad: 4, inteligencia: -1 },
     habilidades: []
   }, 
   { 
     id: "berserker_runico", 
     nombre: "Berserker Rúnico", 
     lore: "Luchadores impulsados por la furia ciega y tatuajes arcanos. Ignoran su propia seguridad para infligir daño catastrófico.", 
     bonificadores: { fuerza: 5, agilidad: 0, inteligencia: -1 },
     habilidades: []
   }, 
   { 
     id: "cazador_bestias", 
     nombre: "Cazador de Bestias", 
     lore: "Tiradores expertos y rastreadores implacables. Mantienen la distancia mientras desgastan a sus presas con precisión letal.", 
     bonificadores: { fuerza: 1, agilidad: 4, inteligencia: -1 },
     habilidades: [HABILIDADES_BASE["ID_VIENTO"]]
   }, 
   { 
     id: "monje_cenizas", 
     nombre: "Monje de las Cenizas", 
     lore: "Artistas marciales que canalizan su ki para realizar golpes devastadores sin necesidad de armas pesadas.", 
     bonificadores: { fuerza: 2, agilidad: 3, inteligencia: -1 },
     habilidades: [HABILIDADES_BASE["ID_CORTE_CRUZADO"]]
   }, 
   { 
     id: "bailarin_espadas", 
     nombre: "Bailarín de Espadas", 
     lore: "Convierten el combate en un arte fluido. Su velocidad es tal que parecen desvanecerse entre los ataques enemigos.", 
     bonificadores: { fuerza: 1, agilidad: 5, inteligencia: -2 },
     habilidades: [HABILIDADES_BASE["ID_CORTE_CRUZADO"]]
   }, 
   { 
     id: "ingeniero_asedio", 
     nombre: "Ingeniero de Asedio", 
     lore: "Inventores de artefactos explosivos y armas de repetición. Confían en la pólvora y los mecanismos más que en la magia.", 
     bonificadores: { fuerza: 2, agilidad: 2, inteligencia: 0 },
     habilidades: [HABILIDADES_BASE["ID_PIRO"]]
   }, 
 
   // --- DPS MÁGICOS (INTELIGENCIA) --- 
   { 
     id: "mago_arcano", 
     nombre: "Canalizador Arcano", 
     lore: "Conductores de magia pura y destructiva. Sus hechizos alteran el campo de batalla, aunque son físicamente vulnerables.", 
     bonificadores: { fuerza: -2, agilidad: 1, inteligencia: 5 },
     habilidades: [HABILIDADES_BASE["ID_PIRO"], HABILIDADES_BASE["ID_VIENTO"]]
   }, 
   { 
     id: "nigromante", 
     nombre: "Nigromante", 
     lore: "Eruditos de lo macabro. Manipulan la energía vital, debilitan a sus oponentes y entienden los secretos que oculta la muerte.", 
     bonificadores: { fuerza: -1, agilidad: 1, inteligencia: 4 },
     habilidades: []
   }, 
   { 
     id: "invocador_vacio", 
     nombre: "Invocador del Vacío", 
     lore: "Pactan con entidades de otras dimensiones para que luchen por ellos. Su mente es un portal hacia terrores cósmicos.", 
     bonificadores: { fuerza: -2, agilidad: 1, inteligencia: 5 },
     habilidades: []
   }, 
   { 
     id: "ilusionista", 
     nombre: "Ilusionista de los Espejos", 
     lore: "Maestros del engaño. No destruyen con fuego, sino destrozando la mente y la percepción de sus enemigos.", 
     bonificadores: { fuerza: -1, agilidad: 1, inteligencia: 4 },
     habilidades: []
   }, 
   { 
     id: "segador_almas", 
     nombre: "Segador de Almas", 
     lore: "Magos de combate que canalizan magia oscura a través de armas vinculadas, siendo letales tanto de cerca como de lejos.", 
     bonificadores: { fuerza: 2, agilidad: 0, inteligencia: 2 },
     habilidades: []
   }, 
 
   // --- SOPORTES Y SANADORES --- 
   { 
     id: "clerigo_sangre", 
     nombre: "Clérigo de Sangre", 
     lore: "Entienden que para dar vida, a veces hay que tomarla. Utilizan rituales antiguos para restaurar la vitalidad del grupo.", 
     bonificadores: { fuerza: 1, agilidad: 0, inteligencia: 3 },
     habilidades: []
   }, 
   { 
     id: "bardo_lamentos", 
     nombre: "Bardo de los Lamentos", 
     lore: "Sus melodías no inspiran esperanza, sino que infunden terror en los enemigos y desatan adrenalina en sus aliados.", 
     bonificadores: { fuerza: -1, agilidad: 2, inteligencia: 3 },
     habilidades: []
   }, 
   { 
     id: "alquimista_plagas", 
     nombre: "Alquimista de Plagas", 
     lore: "Mezclan toxinas letales y antídotos milagrosos. Controlan el ritmo del combate mediante daño prolongado y curaciones.", 
     bonificadores: { fuerza: 0, agilidad: 2, inteligencia: 2 },
     habilidades: []
   }, 
   { 
     id: "guardian_bosque", 
     nombre: "Guardián del Bosque (Druida)", 
     lore: "Conectados a las raíces del mundo. Pueden endurecer su piel como la corteza y sanar mediante la energía de la tierra.", 
     bonificadores: { fuerza: 2, agilidad: -1, inteligencia: 3 },
     habilidades: []
   }, 
   { 
     id: "oraculo_ciego", 
     nombre: "Oráculo Ciego", 
     lore: "Renunciaron a su visión física para ver los hilos del destino. Previenen desastres antes de que ocurran y potencian al grupo.", 
     bonificadores: { fuerza: -2, agilidad: 0, inteligencia: 6 },
     habilidades: []
   } 
 ]; 
 
 export const TRASFONDOS: Trasfondo[] = [ 
   { 
     id: "superviviente", 
     nombre: "Último Superviviente", 
     lore: "Tu ciudad fue reducida a cenizas por fuerzas que no logras comprender. Eres el único que queda y llevas la carga de su memoria." 
   }, 
   { 
     id: "erudito_prohibido", 
     nombre: "Erudito Prohibido", 
     lore: "Leíste el tomo equivocado en la biblioteca del rey. El conocimiento te volvió un objetivo y te arrebató tu vida anterior." 
   }, 
   { 
     id: "mercenario_traicionado", 
     nombre: "Mercenario Traicionado", 
     lore: "Confiabas en tu compañía, pero te vendieron por un puñado de oro a una entidad oscura. Tu honor fue manchado con sangre." 
   }, 
   { 
     id: "noble_desterrado", 
     nombre: "Noble Desterrado", 
     lore: "Naciste en la opulencia, pero una conspiración te arrebató tu título, tus tierras y a tu familia. Ahora solo tienes tu determinación." 
   }, 
   { 
     id: "experimento_profugo", 
     nombre: "Experimento Prófugo", 
     lore: "Despertaste en un laboratorio rodeado de cadáveres. Escapaste de tus creadores, pero aún llevas sus cicatrices en tu cuerpo y mente." 
   } 
 ];
