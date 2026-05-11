# Resumen de Proyecto para Gemini: Codeverso History

Hola Gemini! Este es el estado actual del proyecto **Codeverso History** para que podamos planificar los siguientes pasos.

## 1. Visión y Concepto
- **Género:** RPG Narrativo basado en texto.
- **Mecánica Core:** Interacción restringida (solo botones generados por IA), combate matemático por dados (Ataque + Atributo vs Defensa) narrado por la IA.
- **UI/UX:** Estilo "Shiny" (moderno, oscuro, con efectos de aurora y botones metálicos), inspirado en VicTechWeb.

## 2. Stack Tecnológico Implementado
- **Frontend:** Next.js 15+ (App Router), TypeScript, Tailwind CSS 4.
- **Backend/IA:** Groq API (Modelo: `llama-3.3-versatile`) con arquitectura multi-agente (Narrador, Diálogo, Combate).
- **Persistencia:** Firebase (Firestore y Authentication) ya configurado.
- **Repositorio:** Git (GitHub) vinculado y actualizado.

## 3. Lo que YA está creado y configurado
- **Estructura Base:** Proyecto Next.js funcional con App Router.
- **Wizard de Creación:** Sistema "Zero Text Input" basado en botones que genera prompts visuales y narrativos dinámicos.
- **Motor Visual:** Pipeline automatizado usando Hugging Face (FLUX.1-dev) y Sanity CMS para retratos de personajes y enemigos.
- **Motor de Combate:** Lógica basada en d20, iniciativa, críticos y sinergias elementales (portado de Python).
- **IA Multi-Agente:** 3 agentes (Narrador, Diálogo, Combate) con balanceo de carga entre 3 API Keys de Groq.
- **Habilidades Procedurales:** Generación de habilidades únicas cada 3 niveles mediante IA, almacenadas en un compendio global persistente.
- **Firebase:** Firestore para personajes/partidas y Google Auth para sesiones.

## 4. Estado Actual de Archivos Clave
- `src/actions/`: Lógica de servidor para combate, narrativa, diálogo, visuales y habilidades procedurales.
- `src/components/game/`: Componentes UI "Shiny" (CharacterPanel, CharacterCreator, CombatLog, etc.).
- `src/types/game.ts`: Definición estricta de interfaces RPG.
- `src/data/compendium.ts`: Base de datos estática de razas, clases y habilidades base.

## 5. Próximos Pasos Pendientes (A planificar)
- Implementación de la colección `misiones` en Firestore.
- Refinamiento de la UI de combate (visualización de enemigos y efectos).
- Sistema de equipamiento funcional (matemática de stats aplicada al personaje).

---
*Este documento fue generado para facilitar el traspaso de contexto entre IAs.*
