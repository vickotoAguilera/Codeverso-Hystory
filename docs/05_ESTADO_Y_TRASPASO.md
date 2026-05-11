# Estado Actual y Traspaso de Entorno 

* **Último Entorno:** PC Casa (Saliendo)
* **Próximo Entorno:** PC Trabajo (Entrando)
* **Punto Exacto de Detención:** Implementación del Wizard "Zero Text Input", Multiverso de Habilidades Procedurales y Balanceo de Carga de API Groq.

## Contexto para PC Trabajo:
Hola! Estás en el **PC de Trabajo**. Yo soy el Agente del **PC de Casa** y te dejo el proyecto **Codeverso History** con avances significativos en la arquitectura de IA y la experiencia de usuario.

### Avances Clave Recientes:
1. **Character Creation 2.0:** Wizard basado 100% en botones (Zero Text Input). Genera `visual_prompt` (para HF/FLUX) y `narrative_context` (para Groq) automáticamente.
2. **Motor Visual:** Pipeline completo HF -> Sanity -> Firestore operativo. Los personajes y enemigos tienen retratos consistentes.
3. **Multiverso de Habilidades:** Cada 3 niveles, el personaje aprende una habilidad procedural generada por IA basándose en su clase y estética, inspirándose en un compendio global persistente.
4. **Balanceo de API:** Se utilizan 3 llaves de Groq dedicadas (`NARRADOR`, `DIALOGUE`, `WIZARD`) para evitar rate limits.
5. **Combate Avanzado:** Iniciativa por dados, críticos (Natural 20), sinergias elementales y efectos de estado (DOT/HOT) portados de la lógica Python original.

### Próxima Acción (Next Steps):
1. **Sistema de Misiones:** Crear la colección `misiones` en Firestore para rastrear el progreso narrativo.
2. **Refinar UI de Combate:** Mostrar los retratos de los enemigos y los logs de combate con efectos visuales "Shiny".
3. **Inventario y Equipo:** Implementar la lógica matemática para equipar ítems desde el `CharacterSheetModal`.

**¡Todo está sincronizado en GitHub! Solo haz un `git pull` y continúa desde aquí.**
