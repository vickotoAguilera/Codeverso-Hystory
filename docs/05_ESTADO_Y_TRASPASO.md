# Estado Actual y Traspaso de Entorno 

* **Último Entorno:**  PC Trabajo 
* **Punto Exacto de Detención:** Implementación de la lógica core (Agentes Narrador/Combate) y Panel de Personaje UI.
* **Contexto Pendiente:**  Implementar el guardado dinámico en Firestore y conectar la UI de la landing page con el inicio de la narrativa real.
* **Próxima Acción (Next Steps):**  
  1. Crear la vista principal del juego (`src/app/game/page.tsx`) que integre el `CharacterPanel` y el flujo de narrativa.
  2. Implementar funciones de Firestore para `setDoc` y `getDoc` del estado del personaje.
  3. Conectar el botón "NUEVA PARTIDA" con la primera llamada al Agente Narrador.
