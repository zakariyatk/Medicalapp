export type FamilyMember = {
  id: string;
  name: string;
  initials: string;
  color: string;
  relation: string;
  dob: string;
  age?: number;
  bloodGroup?: string;
  allergies?: string[];
  conditions?: string[];
  access: "owner" | "full" | "child" | "pending";
};

export const familyMembers: FamilyMember[] = [
  {
    id: "harish",
    name: "Harish Sakariya",
    initials: "HS",
    color: "#0F766E",
    relation: "Account owner",
    dob: "14 Jun 1988",
    bloodGroup: "O+",
    access: "owner",
  },
  {
    id: "nisha",
    name: "Nisha Sakariya",
    initials: "NS",
    color: "#4F46E5",
    relation: "Spouse",
    dob: "02 Mar 1990",
    bloodGroup: "A+",
    access: "full",
  },
  {
    id: "aarav",
    name: "Aarav Sakariya",
    initials: "AS",
    color: "#B45309",
    relation: "Son",
    dob: "19 Sep 2017",
    age: 9,
    bloodGroup: "B+",
    allergies: ["Penicillin"],
    conditions: ["Asthma — mild"],
    access: "child",
  },
  {
    id: "kavya",
    name: "Kavya Sakariya",
    initials: "KS",
    color: "#BE185D",
    relation: "Daughter",
    dob: "05 Jan 2021",
    age: 5,
    bloodGroup: "B+",
    access: "child",
  },
  {
    id: "devki",
    name: "Devki Sakariya",
    initials: "DS",
    color: "#9AA3AE",
    relation: "Mother",
    dob: "—",
    access: "pending",
  },
];

export type Medicine = {
  id: string;
  name: string;
  genericName: string;
  manufacturer: string;
  form: string;
  category: string;
  dosage: string;
  frequency: string;
  instructions: string;
  duration: string;
  sideEffectsCommon: string[];
  sideEffectsSerious: string[];
  allergyWarning?: string;
};

export const medicines: Record<string, Medicine> = {
  amoxicillin: {
    id: "amoxicillin",
    name: "Amoxicillin 500mg",
    genericName: "Amoxicillin trihydrate",
    manufacturer: "Cipla Ltd.",
    form: "Capsule",
    category: "Antibiotic",
    dosage: "1 capsule",
    frequency: "3x daily",
    instructions: "Take after food, with a full glass of water",
    duration: "5 days — complete the full course",
    sideEffectsCommon: ["Nausea, mild stomach upset, diarrhoea", "Mild skin rash or itching"],
    sideEffectsSerious: [
      "Swelling of face/throat, difficulty breathing — seek emergency care",
      "Severe watery diarrhoea with fever — contact doctor immediately",
    ],
    allergyWarning:
      "Aarav has a recorded Penicillin allergy. Amoxicillin is in the same drug family — this was prescribed with that noted; confirm with your doctor if symptoms appear.",
  },
  paracetamol: {
    id: "paracetamol",
    name: "Paracetamol 250mg",
    genericName: "Acetaminophen",
    manufacturer: "GSK",
    form: "Tablet",
    category: "Pain relief / Fever",
    dosage: "1 tablet",
    frequency: "As needed, max 4 per day",
    instructions: "Take with or without food",
    duration: "As needed for fever or pain",
    sideEffectsCommon: ["Rare at normal dose"],
    sideEffectsSerious: ["Liver damage with overdose — never exceed 4 doses/day"],
  },
  ors: {
    id: "ors",
    name: "ORS Rehydration Sachet",
    genericName: "Oral rehydration salts",
    manufacturer: "Generic",
    form: "Sachet",
    category: "Rehydration",
    dosage: "1 sachet in 200ml water",
    frequency: "Twice daily",
    instructions: "Dissolve fully before drinking",
    duration: "While symptoms last",
    sideEffectsCommon: ["None expected"],
    sideEffectsSerious: [],
  },
};

export type Prescription = {
  id: string;
  memberId: string;
  doctorName: string;
  specialization: string;
  hospital: string;
  date: string;
  time: string;
  followUp?: string;
  notes?: string;
  medicineIds: string[];
};

export const prescriptions: Prescription[] = [
  {
    id: "rx1",
    memberId: "aarav",
    doctorName: "Dr. Priya Mehta",
    specialization: "Pediatrician",
    hospital: "Apollo Hospital, Ahmedabad",
    date: "07 Nov 2026",
    time: "11:20 AM",
    followUp: "14 Nov 2026",
    notes:
      "Give antibiotics for the full 5 days even after fever subsides. Plenty of fluids and rest. Return if fever persists beyond 2 days.",
    medicineIds: ["amoxicillin", "paracetamol", "ors"],
  },
  {
    id: "rx2",
    memberId: "aarav",
    doctorName: "Dr. Priya Mehta",
    specialization: "Pediatrician",
    hospital: "Apollo Hospital, Ahmedabad",
    date: "22 Sep 2026",
    time: "5:40 PM",
    medicineIds: ["paracetamol"],
  },
  {
    id: "rx3",
    memberId: "harish",
    doctorName: "Dr. Anil Kapoor",
    specialization: "General Physician",
    hospital: "City Care Clinic",
    date: "02 Nov 2026",
    time: "6:10 PM",
    medicineIds: ["paracetamol"],
  },
];

export type LabReport = {
  id: string;
  memberId: string;
  testName: string;
  labName: string;
  date: string;
  status: "normal" | "review" | "pending";
  summary: string;
  orderedBy?: string;
};

export const labReports: LabReport[] = [
  {
    id: "lab1",
    memberId: "aarav",
    testName: "Complete Blood Count (CBC)",
    labName: "Apollo Diagnostics",
    date: "08 Nov 2026",
    status: "normal",
    summary: "All values within normal range.",
    orderedBy: "Dr. Priya Mehta",
  },
  {
    id: "lab2",
    memberId: "harish",
    testName: "Lipid Profile",
    labName: "City Care Clinic Lab",
    date: "01 Nov 2026",
    status: "review",
    summary: "LDL cholesterol slightly elevated — follow up recommended.",
    orderedBy: "Dr. Anil Kapoor",
  },
  {
    id: "lab3",
    memberId: "nisha",
    testName: "Thyroid Panel (TSH)",
    labName: "Apollo Diagnostics",
    date: "28 Oct 2026",
    status: "pending",
    summary: "Report processing — results expected within 24 hours.",
  },
];

export type Dose = {
  id: string;
  memberId: string;
  medicineId: string;
  time: string;
  taken: boolean;
};

export const initialDoses: Dose[] = [
  { id: "d1", memberId: "aarav", medicineId: "amoxicillin", time: "8:00 AM", taken: true },
  { id: "d2", memberId: "harish", medicineId: "paracetamol", time: "9:00 AM", taken: false },
  { id: "d3", memberId: "kavya", medicineId: "ors", time: "9:30 PM", taken: false },
];
