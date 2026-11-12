import { familyMembers, initialDoses, labReports, medicines, type Prescription } from "../data/mockData";

/**
 * Health screening: turns what the doctor wrote on a prescription (diagnosis, notes, medicines)
 * into body areas to highlight and a few facts to show. Matching is by keyword, so it works on
 * the device with no network. A diagnosis read from a scanned prescription (see prescriptionAI)
 * flows through the same rules.
 *
 * This only restates the doctor's own diagnosis in a visual way. It never makes a diagnosis.
 */

export type BodyRegion =
  | "head"
  | "throat"
  | "thyroid"
  | "lungs"
  | "heart"
  | "stomach"
  | "shoulders"
  | "knees"
  | "skin"
  | "wholeBody";

export type Finding = {
  /** Short tab name, e.g. "ENT". */
  system: string;
  region: BodyRegion;
  /** Label shown beside the body, e.g. "Tonsils & throat". */
  area: string;
  /** One plain sentence about what this means for the body. */
  detail: string;
};

type Rule = { match: RegExp } & Finding;

const RULES: Rule[] = [
  { match: /tonsil|throat|pharyng|strep/i, system: "ENT", region: "throat", area: "Tonsils & throat", detail: "Swelling and infection at the back of the throat." },
  { match: /fever|pyrexia|viral/i, system: "General", region: "wholeBody", area: "Body temperature", detail: "Raised temperature as the body fights an infection." },
  { match: /asthma|cough|bronch|lung|pneumon|wheez|breath/i, system: "Respiratory", region: "lungs", area: "Lungs & airways", detail: "Airways in the chest are affected." },
  { match: /headache|migraine|head/i, system: "Neurology", region: "head", area: "Head", detail: "Pain or pressure in the head." },
  { match: /neck|cervical|stiff/i, system: "Muscles", region: "shoulders", area: "Neck & shoulders", detail: "Tight neck and shoulder muscles." },
  { match: /stomach|gastr|diarr|vomit|acidity|abdomen|indigestion/i, system: "Digestive", region: "stomach", area: "Stomach", detail: "The stomach and gut are affected." },
  { match: /heart|cardiac|hypertension|blood pressure|\bbp\b|cholesterol|lipid/i, system: "Heart", region: "heart", area: "Heart & blood vessels", detail: "Heart health needs watching." },
  { match: /thyroid|tsh/i, system: "Hormones", region: "thyroid", area: "Thyroid gland", detail: "The thyroid gland in the neck." },
  { match: /knee|arthrit|joint/i, system: "Joints", region: "knees", area: "Knee joints", detail: "Joint pain or swelling." },
  { match: /shoulder/i, system: "Joints", region: "shoulders", area: "Shoulder joint", detail: "Shoulder pain or stiffness." },
  { match: /rash|eczema|skin|derma|itch/i, system: "Skin", region: "skin", area: "Skin", detail: "Skin irritation or rash." },
];

export type Screening = {
  memberName: string;
  diagnosis: string;
  findings: Finding[];
  /** Infection / inflammation / long-term, from the medicines and wording. */
  kind: string;
  treatment: { count: number; names: string[]; longest: string };
  course?: { day: number; total: number; percent: number };
  dosesToday?: { taken: number; total: number };
  followUp?: string;
  watchFor: string[];
  relatedLab?: { name: string; summary: string; status: string };
};

const MONTHS: Record<string, number> = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
};

/** "07 Nov 2026" → Date */
function parseDate(text: string): Date | undefined {
  const [d, m, y] = text.split(" ");
  if (!d || !(m in MONTHS) || !y) return undefined;
  return new Date(Number(y), MONTHS[m], Number(d));
}

export function screenPrescription(rx: Prescription, today = new Date()): Screening {
  const member = familyMembers.find((m) => m.id === rx.memberId);
  const meds = rx.medicineIds.map((id) => medicines[id]).filter(Boolean);
  const text = [rx.diagnosis, rx.notes, ...meds.map((m) => m.category)].filter(Boolean).join(" · ");

  // One finding per body area, in the order the doctor's words mention them.
  const findings: Finding[] = [];
  for (const rule of RULES) {
    if (rule.match.test(rx.diagnosis ?? "") || rule.match.test(rx.notes ?? "")) {
      if (!findings.some((f) => f.area === rule.area)) {
        const { match: _match, ...finding } = rule;
        findings.push(finding);
      }
    }
  }
  if (findings.length === 0) {
    findings.push({ system: "General", region: "wholeBody", area: "General health", detail: "No specific body area was named." });
  }

  const kind = /antibiotic|infection|itis\b|tonsil|strep|bacterial/i.test(text)
    ? "Infection"
    : /chronic|hypertension|diabetes|thyroid|asthma|cholesterol/i.test(text)
      ? "Long-term condition"
      : /fever|viral/i.test(text)
        ? "Short illness"
        : "Check-up";

  // Course progress from the longest fixed-length course, e.g. "5 days".
  let course: Screening["course"];
  const start = parseDate(rx.date);
  const days = Math.max(0, ...meds.map((m) => Number(/(\d+)\s*days?/i.exec(m.duration)?.[1] ?? 0)));
  if (start && days > 0) {
    const elapsed = Math.floor((today.getTime() - start.getTime()) / 86_400_000) + 1;
    const day = Math.min(Math.max(elapsed, 1), days);
    course = { day, total: days, percent: Math.round((day / days) * 100) };
  }

  const todays = initialDoses.filter((d) => d.memberId === rx.memberId && rx.medicineIds.includes(d.medicineId));
  const lab = labReports.find((l) => l.memberId === rx.memberId);

  return {
    memberName: member?.name.split(" ")[0] ?? "—",
    diagnosis: rx.diagnosis ?? "Not written on the prescription",
    findings,
    kind,
    treatment: {
      count: meds.length,
      names: meds.map((m) => m.name),
      longest: days > 0 ? `${days} days` : (meds[0]?.duration ?? "—"),
    },
    course,
    dosesToday: todays.length ? { taken: todays.filter((d) => d.taken).length, total: todays.length } : undefined,
    followUp: rx.followUp,
    watchFor: [
      ...meds.flatMap((m) => (m.allergyWarning ? ["Allergy: " + m.allergyWarning.split(".")[0]] : [])),
      ...meds.flatMap((m) => m.sideEffectsSerious.map((s) => s.split(" — ")[0])),
    ].slice(0, 3),
    relatedLab: lab ? { name: lab.testName, summary: lab.summary, status: lab.status } : undefined,
  };
}
