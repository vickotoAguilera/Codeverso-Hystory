"use server";

import { db } from "@/lib/firebase";
import { doc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import { generatePortrait } from "@/lib/huggingface";
import { sanityClient } from "@/lib/sanity";

/**
 * Server Action: Genera un retrato con HF, lo sube a Sanity y guarda la URL en Firestore.
 * @param entidadId - ID de la entidad en Firestore
 * @param coleccion - Nombre de la colección ('personajes', 'partidas' para grupo, o 'enemigos')
 * @param descripcion - Prompt descriptivo para la IA
 */
export async function generateAndStorePortrait(
  entidadId: string,
  coleccion: "personajes" | "partidas" | "enemigos",
  descripcion: string
) {
  try {
    console.log(`Iniciando generación de retrato para ${entidadId} en ${coleccion}...`);

    // 1. Generar imagen con Hugging Face
    const imageBuffer = await generatePortrait(descripcion);

    // 2. Subir a Sanity
    const asset = await sanityClient.assets.upload('image', imageBuffer, {
      filename: `${entidadId}_portrait.png`,
      contentType: 'image/png',
    });

    const imageUrl = asset.url;
    console.log(`Imagen subida a Sanity: ${imageUrl}`);

    // 3. Actualizar Firestore
    if (coleccion === "personajes") {
      const docRef = doc(db, "personajes", entidadId);
      await updateDoc(docRef, { retrato: imageUrl });
    } else if (coleccion === "enemigos") {
      // Para enemigos en la narrativa actual de la partida
      const q = query(collection(db, "partidas"), where("ultimaNarrativa.enemigos", "!=", null));
      const querySnapshot = await getDocs(q);
      
      for (const gameDoc of querySnapshot.docs) {
        const gameData = gameDoc.data();
        const nuevosEnemigos = gameData.ultimaNarrativa.enemigos.map((e: any) => 
          e.id === entidadId ? { ...e, retrato: imageUrl } : e
        );
        
        if (JSON.stringify(nuevosEnemigos) !== JSON.stringify(gameData.ultimaNarrativa.enemigos)) {
          await updateDoc(doc(db, "partidas", gameDoc.id), {
            "ultimaNarrativa.enemigos": nuevosEnemigos
          });
        }
      }
    }

    return { success: true, url: imageUrl };
  } catch (error) {
    console.error("Error en generateAndStorePortrait:", error);
    return { success: false, error: (error as Error).message };
  }
}
