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
- **Estructura Base:** Proyecto Next.js inicializado en la raíz.
- **Documentación:** Carpeta `docs/` con visión, arquitectura, modelos de datos y bitácoras.
- **Variables de Entorno (.env):** 
  - 3 API Keys de Groq (una para cada agente).
  - Configuración completa de Firebase.
- **Estilos:** `src/app/globals.css` configurado con tema oscuro, animaciones de aurora y clases para botones "shiny".
- **Firebase:** `src/lib/firebase.ts` inicializado con Firestore y Auth. Reglas de seguridad básicas aplicadas.
- **Landing Page:** `src/app/page.tsx` funcional con el diseño visual base y botones de inicio.

## 4. Estado Actual de Archivos Clave
- `package.json`: Dependencias instaladas (`firebase`, `groq-sdk`).
- `.env`: Todas las llaves están listas.
- `docs/`: 5 archivos de documentación técnica y de progreso.

## 5. Próximos Pasos Pendientes (A planificar)
- Definición de la estructura de colecciones en Firestore para guardar personajes y partidas.
- Implementación del Agente Narrador (Prompt Engineering para Groq).
- Creación del Panel de Personaje dinámico (HP, Atributos, Inventario).
- Lógica de la tirada de dados en el frontend/backend.

---
*Este documento fue generado para facilitar el traspaso de contexto entre IAs.*
