
import * as fs from 'fs';
import * as path from 'path';

const MUSIC_DIR = path.join(process.cwd(), 'music');

const MAPPING: Record<string, string> = {
  "World Map.mp3": "Exploracion del Mundo",
  "Woodland Fantasy.mp3": "Bosque de Fantasia",
  "TownTheme.mp3": "Aldea del Inicio",
  "the_nymph_of_the_forest_of_neri.wav": "Santuario Sagrado",
  "the_cave_where_he_saw_hell.wav": "Caverna del Inframundo",
  "song18.mp3": "Tema de Batalla 1",
  "rise_of_the_fomorians.wav": "Combate contra Jefe",
  "moralltach.wav": "Descubrimiento Legendario",
  "Market_Day.mp3": "Ciudad del Comercio",
  "Ireland's Coast (Video Game Soundtrack -Live).mp3": "Puerto de Aventuras",
  "Ireland&#039;s Coast (Video Game Soundtrack -Live).mp3": "Puerto de Aventuras",
  "Heroic Demise (New).mp3": "Tema de Batalla 2 Desesperacion",
  "Exploration6 - Tropical Island.ogg": "Isla de las Palmeras",
  "Exploration5 - Sneaking Around.ogg": "Fortaleza Enemiga Infiltracion",
  "Exploration4 - Prairie Nights.ogg": "Pradera Bajo las Estrellas",
  "Exploration3 - Tha'el Mines.ogg": "Minas de Thael",
  "Exploration2 - Military Base.ogg": "Base del Imperio",
  "exodus_of_the_tuatha_de_danann.wav": "Marcha del Exilio",
  "Evil5 - Whispers From Beyond.ogg": "Ruinas Malditas",
  "Evil4 - Witch's Lair.ogg": "Guarida de la Bruja",
  "Evil3 - Apocalypse.ogg": "El Fin del Mundo",
  "Evil2 - Catacombs.ogg": "Catacumbas Oscuras",
  "Evil1 - Ancient Evil Awakens.ogg": "Despertar del Mal",
  "enslaved_by_celtic_raiders.wav": "Emboscada Enemiga",
  "Damiano_Baldoni_-_Celtic_Warrior.mp3": "Tema de Batalla 3 Guerreros",
  "cu_chullain.wav": "Leyenda del Guerrero",
  "CleytonRX - Battle RPG Theme.mp3": "Tema de Batalla 4 Aleatorio",
  "children_of_lir.wav": "Canto del Lago Misterioso",
  "cave themeb4.ogg": "Cueva Profunda",
  "Calm6 - Innocence.ogg": "Recuerdos del Pasado",
  "Calm5 - Summer Memories.ogg": "Tarde en la Aldea",
  "Calm4 - Sand Castles.ogg": "Costa Pacifica",
  "Calm3 - Peaceful Days.ogg": "Descanso en la Posada",
  "Calm2 - Childhood Friends.ogg": "Tema de Companeros",
  "Calm1 - A Place I Call Home.ogg": "El Pueblo Natal",
  "Caketown 1.mp3": "Pueblo Festivo",
  "battleThemeA.mp3": "Tema de Batalla 5 Comun",
  "awesomeness.wav": "Victoria Gloriosa",
  "Action3 - Preparing For Battle.ogg": "Antes de la Batalla",
  "Action2 - Army Approaching.ogg": "Invasion Enemiga",
  "Action1 - Encounter With The Witches.ogg": "Encuentro con las Brujas",
  "a_saint_lays_claim_to_the_souls_of_the_irish.wav": "Intervencion Divina",
  "a_prayer_in_the_fields_and_god_answered.wav": "Milagro en el Campo"
};

/**
 * Convierte un string a snake_case, eliminando acentos y caracteres especiales.
 */
function toSnakeCase(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Eliminar acentos
    .toLowerCase()
    .replace(/\s+/g, '_') // Espacios a guiones bajos
    .replace(/[^\w]/g, '') // Eliminar todo lo que no sea letra/numero/guion bajo
    .replace(/__+/g, '_') // Evitar multiples guiones bajos
    .replace(/^_|_$/g, ''); // Eliminar guiones bajos al inicio/final
}

async function renameMusic() {
  console.log("🎵 Iniciando proceso de renombramiento de música...");

  if (!fs.existsSync(MUSIC_DIR)) {
    console.error(`❌ Error: El directorio '${MUSIC_DIR}' no existe.`);
    process.exit(1);
  }

  let successCount = 0;
  let errorCount = 0;

  for (const [originalName, semanticTarget] of Object.entries(MAPPING)) {
    const originalPath = path.join(MUSIC_DIR, originalName);
    
    if (fs.existsSync(originalPath)) {
      const ext = path.extname(originalName);
      const newName = `${toSnakeCase(semanticTarget)}${ext}`;
      const newPath = path.join(MUSIC_DIR, newName);

      try {
        fs.renameSync(originalPath, newPath);
        console.log(`✅ Renombrado: "${originalName}" -> "${newName}"`);
        successCount++;
      } catch (error) {
        console.error(`❌ Error al renombrar "${originalName}":`, error);
        errorCount++;
      }
    } else {
      // Verificar si ya fue renombrado (para evitar errores en ejecuciones repetidas)
      const ext = path.extname(originalName);
      const expectedNewName = `${toSnakeCase(semanticTarget)}${ext}`;
      const expectedNewPath = path.join(MUSIC_DIR, expectedNewName);

      if (fs.existsSync(expectedNewPath)) {
        console.log(`ℹ️ Omitiendo: "${originalName}" ya existe como "${expectedNewName}"`);
      } else {
        console.warn(`⚠️ Advertencia: No se encontró el archivo original "${originalName}"`);
        errorCount++;
      }
    }
  }

  console.log(`\n✨ Proceso finalizado.`);
  console.log(`📊 Resumen: ${successCount} exitosos, ${errorCount} advertencias/errores.`);
}

renameMusic();
