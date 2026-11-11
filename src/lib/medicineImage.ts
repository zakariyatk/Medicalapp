/**
 * Medicine photo generation.
 *
 * TODO: wire to a real AI image-generation provider through a backend endpoint (never call an
 * image-gen API with a secret key directly from the app — it would ship inside the client
 * bundle). Once a backend exists, this should call that endpoint with the medicine name/form
 * and return a hosted image URL.
 */

export type GeneratedImageResult = { uri: string } | null;

export async function generateMedicineImage(_medicineName: string, _form: string): Promise<GeneratedImageResult> {
  await new Promise((resolve) => setTimeout(resolve, 1200));
  return null;
}
