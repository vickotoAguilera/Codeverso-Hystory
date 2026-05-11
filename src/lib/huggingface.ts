/**
 * UTILIDAD HUGGING FACE (Inference API)
 * Pipeline para generación de retratos de estilo RPG.
 */

const HF_API_URL = "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-dev"; // Modelo de alta calidad

/**
 * Genera un retrato basado en un prompt descriptivo.
 * @param {string} prompt - Descripción de la entidad (ej: "A dark goblin rogue with yellow eyes")
 * @returns {Promise<Buffer>} Buffer de la imagen generada
 */
export async function generatePortrait(prompt: string): Promise<Buffer> {
  const apiKey = process.env.HUGGING_FACE_API_KEY;

  if (!apiKey) {
    throw new Error("HUGGING_FACE_API_KEY no configurada en las variables de entorno.");
  }

  // Enriquecer el prompt para estilo RPG oscuro
  const enrichedPrompt = `RPG portrait style, dark fantasy, highly detailed, oil painting texture, professional character design, ${prompt}, solid dark background, centered composition, dramatic lighting.`;

  try {
    const response = await fetch(HF_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: enrichedPrompt,
        parameters: {
          guidance_scale: 7.5,
          num_inference_steps: 30,
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`HF API Error: ${errorData.error || response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error("Error generating portrait with Hugging Face:", error);
    throw error;
  }
}
