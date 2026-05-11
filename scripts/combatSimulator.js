/**
 * SIMULADOR DE COMBATE MATEMÁTICO (Tales RPG)
 * Este script realiza simulaciones Monte Carlo para balancear las estadísticas del juego.
 * Ejecución: node scripts/combatSimulator.js
 */

const fs = require('fs');

// Configuración de Entidades Base (Simulando datos del compendio)
const HEROE_BASE = {
  nombre: "Héroe de Pruebas",
  nivel: 1,
  hpMax: 20,
  hpActual: 20,
  mpMax: 20,
  mpActual: 20,
  atributos: { fuerza: 14, agilidad: 10, inteligencia: 10 },
  clase: "Vanguardia"
};

const ENEMIGO_BASE = {
  nombre: "Goblin de Pruebas",
  hpMax: 15,
  hpActual: 15,
  defensa: 12,
  danioBase: 4,
  habilidades: [
    { nombre: "Mordisco", multiplicador: 1.0, costo_mp: 0 }
  ]
};

/**
 * Simula un solo combate a muerte.
 * @returns {Object} Resultado del combate
 */
function simularCombate(nivelHeroe = 1, nivelEnemigo = 1) {
  // Escalar estadísticas por nivel
  const heroe = {
    ...HEROE_BASE,
    nivel: nivelHeroe,
    hpMax: 20 + (nivelHeroe - 1) * 8,
    atributos: { 
      fuerza: 14 + (nivelHeroe - 1), 
      agilidad: 10 + Math.floor(nivelHeroe / 2),
      inteligencia: 10 
    }
  };
  heroe.hpActual = heroe.hpMax;

  const enemigo = {
    ...ENEMIGO_BASE,
    hpMax: 15 + (nivelEnemigo - 1) * 10,
    defensa: 11 + nivelEnemigo,
    danioBase: 4 + nivelEnemigo
  };
  enemigo.hpActual = enemigo.hpMax;

  let turnos = 0;
  let danioRecibidoTotal = 0;

  while (heroe.hpActual > 0 && enemigo.hpActual > 0 && turnos < 50) {
    turnos++;

    // --- TURNO DEL HÉROE ---
    const tiradaAtaque = Math.floor(Math.random() * 20) + 1;
    const totalAtaque = tiradaAtaque + heroe.atributos.fuerza;

    if (totalAtaque >= enemigo.defensa) {
      // Impacto (D8 + Fuerza/2)
      const danioBase = Math.floor(Math.random() * 8) + 1;
      const danioTotal = danioBase + Math.floor(heroe.atributos.fuerza / 2);
      enemigo.hpActual -= danioTotal;
    }

    if (enemigo.hpActual <= 0) break;

    // --- TURNO DEL ENEMIGO ---
    const tiradaEnemigo = Math.floor(Math.random() * 20) + 1;
    const totalDefensaHeroe = 10 + heroe.atributos.agilidad; // CA Base

    if (tiradaEnemigo + enemigo.danioBase >= totalDefensaHeroe) {
      const danioEnemigo = Math.floor(Math.random() * 4) + enemigo.danioBase;
      heroe.hpActual -= danioEnemigo;
      danioRecibidoTotal += danioEnemigo;
    }
  }

  return {
    victoria: heroe.hpActual > 0,
    turnos,
    danioRecibido: danioRecibidoTotal,
    hpFinal: Math.max(0, heroe.hpActual)
  };
}

/**
 * Ejecuta una batería de pruebas
 */
function ejecutarPruebas(iteraciones = 100, nivel = 1) {
  console.log(`\n=== INICIANDO SIMULACIÓN NIVEL ${nivel} (${iteraciones} COMBATES) ===`);
  
  const resultados = [];
  for (let i = 0; i < iteraciones; i++) {
    resultados.push(simularCombate(nivel, nivel));
  }

  const victorias = resultados.filter(r => r.victoria).length;
  const avgTurnos = resultados.reduce((acc, r) => acc + r.turnos, 0) / iteraciones;
  const avgDanio = resultados.reduce((acc, r) => acc + r.danioRecibido, 0) / iteraciones;
  const winRate = (victorias / iteraciones) * 100;

  console.log(`-------------------------------------------`);
  console.log(`Tasa de Victoria: ${winRate.toFixed(2)}%`);
  console.log(`Promedio de Turnos: ${avgTurnos.toFixed(2)}`);
  console.log(`Daño Recibido Promedio: ${avgDanio.toFixed(2)}`);
  console.log(`-------------------------------------------`);

  if (winRate < 60) console.log("⚠️ ALERTA: Dificultad muy alta. Considerar buff al héroe.");
  if (winRate > 90) console.log("⚠️ ALERTA: Demasiado fácil. Considerar buff al enemigo.");
}

// Ejecutar para hitos clave
ejecutarPruebas(100, 1);
ejecutarPruebas(100, 3);
ejecutarPruebas(100, 5);
ejecutarPruebas(100, 10);
