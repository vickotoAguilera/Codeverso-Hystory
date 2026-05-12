
export const R2_URL_BASE = process.env.NEXT_PUBLIC_R2_URL_BASE || "";

export const AUDIO_MAPPING = {
  // Temas Ambientales / Exploración
  world_map: "exploracion_del_mundo.mp3",
  woodland: "bosque_de_fantasia.mp3",
  town: "aldea_del_inicio.mp3",
  forest_nymph: "santuario_sagrado.wav",
  cave_hell: "caverna_del_inframundo.wav",
  song_18: "tema_de_batalla_1.mp3",
  fomorians_rise: "combate_contra_jefe.wav",
  moralltach: "descubrimiento_legendario.wav",
  market: "ciudad_del_comercio.mp3",
  ireland_coast: "puerto_de_aventuras.mp3",
  heroic_demise: "tema_de_batalla_2_desesperacion.mp3",
  tropical_island: "isla_de_las_palmeras.ogg",
  sneaking: "fortaleza_enemiga_infiltracion.ogg",
  prairie_nights: "pradera_bajo_las_estrellas.ogg",
  thael_mines: "minas_de_thael.ogg",
  military_base: "base_del_imperio.ogg",
  tuatha_exodus: "marcha_del_exilio.wav",
  whispers_beyond: "ruinas_malditas.ogg",
  witch_lair: "guarida_de_la_bruja.ogg",
  apocalypse: "el_fin_del_mundo.ogg",
  catacombs: "catacumbas_oscuras.ogg",
  ancient_evil: "despertar_del_mal.ogg",
  celtic_raiders: "emboscada_enemiga.wav",
  celtic_warrior: "tema_de_batalla_3_guerreros.mp3",
  cu_chullain: "leyenda_del_guerrero.wav",
  battle_rpg: "tema_de_batalla_4_aleatorio.mp3",
  children_of_lir: "canto_del_lago_misterioso.wav",
  cave_theme: "cueva_profunda.ogg",
  innocence: "recuerdos_del_pasado.ogg",
  summer_memories: "tarde_en_la_aldea.ogg",
  sand_castles: "costa_pacifica.ogg",
  peaceful_days: "descanso_en_la_posada.ogg",
  childhood_friends: "tema_de_companeros.ogg",
  home_place: "el_pueblo_natal.ogg",
  caketown: "pueblo_festivo.mp3",
  battle_a: "tema_de_batalla_5_comun.mp3",
  awesomeness: "victoria_gloriosa.wav",
  prep_battle: "antes_de_la_batalla.ogg",
  army_approach: "invasion_enemiga.ogg",
  encounter_witches: "encuentro_con_las_brujas.ogg",
  irish_souls: "intervencion_divina.wav",
  prayer_fields: "milagro_en_el_campo.wav",

  // SFX Esenciales (Preload)
  dice_roll: "dice_roll.mp3"
};

export type AudioTrackKey = keyof typeof AUDIO_MAPPING;
