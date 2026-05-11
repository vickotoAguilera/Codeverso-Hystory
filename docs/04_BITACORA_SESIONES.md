# Bitácora de Sesiones y Progreso 

* **[Fecha: 2026-05-10] [Hora: 22:16] [Entorno: PC Trabajo]** 
  * Acción: Inicialización de la documentación del proyecto. Definición de la arquitectura multi-agente, stack tecnológico (Next.js, Tailwind) y configuración del flujo de guardado entre PC Trabajo y PC Casa. 
* **[Fecha: 2026-05-10] [Hora: 22:30] [Entorno: PC Trabajo]**
  * Acción: Configuración de variables de entorno (.env), .gitignore, inicialización de repositorio Git y primer push exitoso a la rama main de GitHub.
* **[Fecha: 2026-05-10] [Hora: 22:45] [Entorno: PC Trabajo]**
  * Acción: Inicialización del proyecto Next.js 15+ con TypeScript y Tailwind CSS. Configuración del tema visual "Shiny" inspirado en VicTechWeb. Implementación de la landing page inicial con efectos de aurora y botones interactivos.
* **[Fecha: 2026-05-10] [Hora: 23:00] [Entorno: PC Trabajo]**
  * Acción: Integración de Firebase (Firestore & Auth). Configuración de variables de entorno para Firebase, creación de `src/lib/firebase.ts` e instalación de dependencias base (`firebase`, `groq-sdk`). Definición de reglas de seguridad iniciales.
* **[Fecha: 2026-05-10] [Hora: 23:10] [Entorno: PC Trabajo]**
  * Acción: Creación de `RESUMEN_PARA_GEMINI.md` para facilitar la planificación externa con otra IA. Sincronización final de la sesión en GitHub.
* **[Fecha: 2026-05-10] [Hora: 23:30] [Entorno: PC Trabajo]**
  * Acción: Implementación de la arquitectura core del juego: Server Actions para Agente Narrador y Agente de Combate. Creación de tipos de datos en TypeScript. Desarrollo del componente `CharacterPanel` (Client Component) con estilos Shiny y React 19. Definición de la estructura de colecciones para Firestore.
* **[Fecha: 2026-05-10] [Hora: 23:50] [Entorno: PC Trabajo]**
  * Acción: Implementación del Sistema de Creación (Opción B). Actualización de modelos (Género, Compañeros, Tríada). Integración de Google Auth en Firebase. Creación de Server Action para sugerencia de nombres con Groq. Actualización del CharacterPanel para mostrar el grupo.
* **[Fecha: 2026-05-11] [Hora: 00:15] [Entorno: PC Trabajo]**
  * Acción: Implementación del Compendio Estático y Wizard Optimizado. Creación de `src/data/compendium.ts` con Lore de Razas, Clases y Trasfondos. Desarrollo del `CharacterCreation.tsx` de 6 pasos. Integración de lógica de Prólogo y Amnesia en el Agente Narrador. Sincronización con Firestore para guardado de personajes y partidas.
* **[Fecha: 2026-05-11] [Hora: 00:30] [Entorno: PC Trabajo]**
  * Acción: Expansión masiva del Compendio Estático. Inclusión de 10 razas, 20 clases (Tanques, DPS Físicos, DPS Mágicos, Soportes) y 5 trasfondos con lore profundo y bonificadores equilibrados.
* **[Fecha: 2026-05-11] [Hora: 00:45] [Entorno: PC Trabajo]**
  * Acción: Implementación de la ruta `/create` y ensamblaje del Wizard. Conexión de la Landing Page con Firebase Auth (Anónimo y Google). Configuración del App Router para la creación de personajes y redirección segura.
* **[Fecha: 2026-05-11] [Hora: 00:55] [Entorno: PC Trabajo]**
  * Acción: Resolución de error de Firebase (auth/admin-restricted-operation). Implementación de manejo de errores en la Landing Page para notificar al usuario sobre la necesidad de habilitar el login anónimo en Firebase Console.
* **[Fecha: 2026-05-11] [Hora: 01:10] [Entorno: PC Trabajo]**
  * Acción: Simplificación del sistema de autenticación. Se eliminó el login anónimo para usar exclusivamente Google Auth. Implementación de lógica de redirección inteligente: detección automática de personajes existentes en Firestore para dirigir al usuario a "Nueva Partida" o "Continuar Aventura".
* **[Fecha: 2026-05-11] [Hora: 01:30] [Entorno: PC Trabajo]**
  * Acción: Implementación del Core Game Loop en la ruta `/game`. Desarrollo del motor de narrativa que gestiona el Prólogo (derrota programada contra el Némesis) y la transición automática a la fase de Aventura. Integración del CharacterPanel con datos reales de Firestore y manejo de Server Actions para combate y narrativa.
* **[Fecha: 2026-05-11] [Hora: 01:45] [Entorno: PC Trabajo]**
  * Acción: Implementación de excepción controlada para entrada de nombre manual en el Wizard. Creación de input con validación Regex estricta (8 letras máx, sin números ni espacios) y estilos "Shiny".
* **[Fecha: 2026-05-11] [Hora: 02:00] [Entorno: PC Trabajo]**
  * Acción: Implementación del Sistema de Daño Real, XP y Muerte. Actualización de modelos con Experiencia y Nivel. Desarrollo de lógica de combate en el servidor que actualiza Firestore. Implementación de motor de resurrección y penalización de XP. Actualización de UI con barra de experiencia dinámica.
* **[Fecha: 2026-05-11] [Hora: 02:15] [Entorno: PC Trabajo]**
  * Acción: Corrección del flujo de selección de clases. Se eliminó la elección de clase del Wizard inicial para iniciar como "Aventureros Novatos". Implementación de la fase `"llegada_gremio"` tras el prólogo, donde el jugador elige su vocación definitiva mediante un evento narrativo especial en el Gremio, actualizando atributos y bonificadores en tiempo real.
* **[Fecha: 2026-05-11] [Hora: 02:30] [Entorno: PC Trabajo]**
  * Acción: Implementación de Trasfondos Dinámicos (IA) en el Wizard. Desarrollo de la lógica de "La Tríada" en el Gremio para asignar compañeros equilibrados automáticamente (Nombres y Actitud vía Groq). Creación del Agente de Diálogo para presentaciones formales e interacción con NPCs.
* **[Fecha: 2026-05-11] [Hora: 02:45] [Entorno: PC Trabajo]**
  * Acción: Resolución de errores de tipado y ejecución en `guild.ts`. Se corrigió la importación de la interfaz `Clase`, se añadió el campo `actitud` al modelo de `Compañero` y se aseguró la compatibilidad de `crypto.randomUUID()` en el servidor. Verificación de build exitosa.
* **[Fecha: 2026-05-11] [Hora: 03:00] [Entorno: PC Trabajo]**
  * Acción: Preparación de traspaso de sesión a PC Casa. Sincronización completa de toda la arquitectura core, lógica de IA, Firebase y estilos Shiny. El proyecto se entrega compilando sin errores y con el flujo de Prólogo -> Gremio -> Aventura totalmente funcional.
* **[Fecha: 2026-05-11] [Hora: 14:05] [Entorno: PC Casa]**
  * Acción: Configuración final de credenciales de Sanity (Project ID: `jpjp695n`) y token de escritura en `.env.local`. Refinamiento de la Server Action `generateAndStorePortrait` para soportar la actualización de enemigos en el array de narrativa actual de Firestore. Implementación del disparador automático de retratos para el panel de enemigos. Motor visual 100% operativo con pipeline FLUX.1 -> Sanity Assets -> Firestore CDN URL.
* **[Fecha: 2026-05-11] [Hora: 16:30] [Entorno: PC Casa]**
  * Acción: Traducción y migración de la lógica RPG legacy (Python) a TypeScript/Next.js. Se portaron las mecánicas de ejecución de habilidades (`executeSkill`), efectos de estado persistentes (DOT/HOT) y etiquetado elemental. Implementación del sistema de Iniciativa (D20 + Velocidad) y el Dado Crítico (Natural 20 con daño x2 y MP restore). Sincronización de interfaces en `game.ts` y actualización del compendio con habilidades de prueba (Piro, Viento, Corte Cruzado). Verificación de integridad de tipos en el motor de combate.
* **[Fecha: 2026-05-11] [Hora: 18:00] [Entorno: PC Casa]**
  * Acción: Implementación del Wizard de Creación de Personajes "Zero Text Input" (`CharacterCreator.tsx`). Se eliminó la entrada de texto manual en favor de grids de botones para Raza, Clase, Estética y Reliquias. Implementación de pipeline de prompts dinámicos: `visual_prompt` con reglas de consistencia de armas (mano derecha/izquierda) para FLUX.1 y `narrative_context` para Groq. Integración con Firestore mediante la nueva colección `jugador` para persistencia de perfil y actualización del Agente Narrador para soportar el "Collar de Telepatía" y rasgos físicos dinámicos.
* **[Fecha: 2026-05-11] [Hora: 19:30] [Entorno: PC Casa]**
  * Acción: Refactorización de balanceo de carga de API Groq e implementación del Multiverso de Habilidades Procedurales. Se asignaron llaves dedicadas (`NARRADOR`, `DIALOGUE`, `WIZARD`) para evitar rate limiting. Implementación de `generateNewSkill` en `src/actions/skills.ts` que utiliza IA para crear habilidades únicas cada 3 niveles basándose en la clase, estética y habilidades globales persistentes. Actualización de la lógica de subida de nivel en `combat.ts` y expansión del modelo `Personaje` con `habilidades_desbloqueadas`.
