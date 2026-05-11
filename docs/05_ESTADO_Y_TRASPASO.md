# Estado Actual y Traspaso de Entorno 

* **Último Entorno:**  PC Trabajo 
* **Punto Exacto de Detención:** Implementación del Core Game Loop y lógica de Prólogo completa.
* **Contexto Pendiente:**  Asegurar que el sistema de combate reste HP real al personaje y añadir el sistema de recompensas (experiencia/inventario) tras los combates en la fase de aventura.
* **Próxima Acción (Next Steps):**  
  1. Probar el flujo completo: Login -> Creación -> Batalla Prólogo -> Despertar en Gremio.
  2. Implementar el sistema de daño dinámico en `src/actions/combat.ts` para que afecte al documento del personaje en Firestore.
  3. Crear el Agente de Diálogo para interacciones profundas con NPCs en el Gremio.
