# Arquitectura del Sistema y APIs 

## Stack Tecnológico 
 * **Frontend:**  Next.js, React, Tailwind CSS. 
 * **Recursos UI:** Los estilos, botones y componentes visuales deben extraerse de la ruta local estricta: `C:\Users\Usuario\Documents\proyectos\uix_and_designs` . 
 * **IA Backend:** Groq API utilizando el modelo `llama-3.3-versatile` . 

## Sistema Multi-Agente (Enrutamiento de IA) 
 Para optimizar tokens y mantener el contexto limpio, se utilizarán tres instancias o "agentes" lógicos en el backend: 
 1. **Agente Narrador:**  Describe el entorno y genera las opciones de interacción (botones). 
 2. **Agente de Diálogos:**  Se invoca solo para conversaciones con NPCs, generando respuestas profundas y contextuales. 
 3. **Agente de Combate:**  Se invoca tras procesar la matemática de los dados. Recibe el resultado exacto (ej. "Ataque 15 vs Defensa 10") y narra el impacto. 
