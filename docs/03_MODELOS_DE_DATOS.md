# Modelos de Datos y Estructuras JSON 

## Estado del Personaje (Frontend) 
 ```json 
 { 
   "personaje": { 
     "nombre": "Jugador", 
     "hp_actual": 20, 
     "hp_max": 20, 
     "atributos": { "fuerza": 10, "agilidad": 10, "inteligencia": 10 }, 
     "inventario": [] 
   } 
 } 
 ```

## Formato Estricto de Respuesta IA (Groq) 
La IA debe responder SIEMPRE con la siguiente estructura JSON validada: 
```json 
 { 
   "narrativa": "Texto descriptivo de la situación o el entorno." , 
   "opciones" : [ 
     { 
       "id": 1 , 
       "texto_boton": "Atacar al enemigo" , 
       "tipo_accion": "combate" , 
       "atributo_requerido": "fuerza" 
     } 
   ] 
 } 
```
