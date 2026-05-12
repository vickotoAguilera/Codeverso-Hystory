

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import * as dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Interfaces (Espejo de src/types/game.ts para evitar problemas de importación en el script)
interface Atributos {
  fuerza: number;
  agilidad: number;
  inteligencia: number;
}

type Elemento = "Fuego" | "Agua" | "Viento" | "Tierra" | "Físico";

interface Habilidad {
  id: string;
  nombre: string;
  tipo: string;
  descripcion: string;
  costo_mp: number;
  poder: number;
  alcance: string;
  elemento: Elemento;
}

interface EnemigoBase {
  id: string;
  nombre: string;
  hpMax: number;
  hpActual: number;
  mpMax: number;
  mpActual: number;
  habilidades: Habilidad[];
  velocidad: number;
  nivel: number;
  retrato?: string;
}

interface ObjetoBase {
  id: string;
  nombre: string;
  lore: string;
  tipo: "arma" | "armadura" | "accesorio" | "consumible";
  slot?: string;
  bonificadores: Partial<Atributos>;
}

// --- DATOS DE SEMILLA ---

const ENEMIGOS: EnemigoBase[] = [
  {
    id: "slime_bosque",
    nombre: "Slime de Bosque",
    hpMax: 40,
    hpActual: 40,
    mpMax: 10,
    mpActual: 10,
    velocidad: 8,
    nivel: 1,
    habilidades: [
      {
        id: "SLIME_PLOP",
        nombre: "Plop!",
        tipo: "Habilidad Fisica",
        descripcion: "Un salto pegajoso que golpea suavemente.",
        costo_mp: 0,
        poder: 10,
        alcance: "Un Enemigo",
        elemento: "Físico"
      }
    ]
  },
  {
    id: "goblin_saqueador",
    nombre: "Goblin Saqueador",
    hpMax: 65,
    hpActual: 65,
    mpMax: 15,
    mpActual: 15,
    velocidad: 12,
    nivel: 3,
    habilidades: [
      {
        id: "GOB_TAJO",
        nombre: "Tajo Sucio",
        tipo: "Habilidad Fisica",
        descripcion: "Un corte rápido con una daga oxidada.",
        costo_mp: 5,
        poder: 20,
        alcance: "Un Enemigo",
        elemento: "Físico"
      }
    ]
  },
  {
    id: "caballero_oscuro",
    nombre: "Caballero Negro del Ocaso",
    hpMax: 250,
    hpActual: 250,
    mpMax: 50,
    mpActual: 50,
    velocidad: 10,
    nivel: 10,
    habilidades: [
      {
        id: "DARK_VOID",
        nombre: "Corte del Vacío",
        tipo: "Magia Negra",
        descripcion: "Un ataque que drena la luz y la esperanza.",
        costo_mp: 15,
        poder: 45,
        alcance: "Un Enemigo",
        elemento: "Físico"
      }
    ]
  }
];

const ITEMS: ObjetoBase[] = [
  {
    id: "pocion_menor",
    nombre: "Poción de Vida Menor",
    lore: "Un brebaje rojizo que huele a fresas silvestres y magia.",
    tipo: "consumible",
    bonificadores: {}
  },
  {
    id: "barniz_fuego",
    nombre: "Barniz de Fuego",
    lore: "Al aplicarlo en el arma, esta emite un calor abrasador.",
    tipo: "consumible",
    bonificadores: {}
  },
  {
    id: "collar_telepatia",
    nombre: "Collar de Telepatía",
    lore: "Permite escuchar susurros del Agente Narrador en tu mente.",
    tipo: "accesorio",
    slot: "accesorio",
    bonificadores: { inteligencia: 2 }
  },
  {
    id: "espada_hierro",
    nombre: "Espada de Hierro",
    lore: "Forjada en las minas del norte, pesada pero confiable.",
    tipo: "arma",
    slot: "mano_derecha",
    bonificadores: { fuerza: 3 }
  }
];

async function seed() {
  console.log("🚀 Iniciando Seeding de Firestore (Client SDK)...");

  try {
    // 1. Sembrar Enemigos
    console.log("👾 Sembrando enemigos en 'mundo_persistente'...");
    for (const enemigo of ENEMIGOS) {
      const docRef = doc(db, "mundo_persistente", enemigo.id);
      await setDoc(docRef, enemigo);
      console.log(`   ✅ Enemigo: ${enemigo.nombre}`);
    }

    // 2. Sembrar Items
    console.log("📦 Sembrando items en 'compendio_items'...");
    for (const item of ITEMS) {
      const docRef = doc(db, "compendio_items", item.id);
      await setDoc(docRef, item);
      console.log(`   ✅ Item: ${item.nombre}`);
    }

    console.log("\n✨ Seeding completado con éxito.");
  } catch (error) {
    console.error("\n❌ Error durante el seeding:", error);
  } finally {
    process.exit(0);
  }
}

seed();
