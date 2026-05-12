import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import { generatePortrait } from "@/lib/huggingface";
import { sanityClient } from "@/lib/sanity";

export async function POST(req: NextRequest) {
  try {
    const { entidadId, coleccion, descripcion } = await req.json() as {
      entidadId: string;
      coleccion: "personajes" | "partidas" | "enemigos";
      descripcion: string;
    };

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

    return NextResponse.json({ success: true, url: imageUrl });
  } catch (error) {
    console.error("Error en generateAndStorePortrait:", error);
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
