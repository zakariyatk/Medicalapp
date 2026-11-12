/**
 * Prescription AI extraction.
 *
 * TODO (wired once Supabase is connected): replace this mock with a call to the
 * `extract-prescription` Supabase Edge Function (see supabase/functions/extract-prescription),
 * which sends the photo to Claude's vision API and returns the same shape below.
 */

export type ExtractedMedicine = {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
};

export type ExtractedPrescription = {
  doctorName: string;
  hospital: string;
  date: string;
  time: string;
  /** The diagnosis as the doctor wrote it — used by the health screening view. */
  diagnosis: string;
  medicines: ExtractedMedicine[];
};

export async function extractPrescriptionFromImage(imageUri: string): Promise<ExtractedPrescription> {
  // Simulated network/AI latency for the demo build.
  await new Promise((resolve) => setTimeout(resolve, 1600));

  return {
    doctorName: "Dr. Priya Mehta",
    hospital: "Apollo Hospital",
    date: "07 Nov 2026",
    time: "11:20 AM",
    diagnosis: "Acute tonsillitis (throat infection) with fever",
    medicines: [
      { name: "Amoxicillin 500mg", dosage: "1 capsule", frequency: "3x daily", duration: "5 days" },
      { name: "Paracetamol 250mg", dosage: "1 tablet", frequency: "As needed for fever", duration: "" },
    ],
  };
}
