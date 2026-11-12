import { useSyncExternalStore } from "react";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

/**
 * A cartoon avatar described by a few visible features. The app draws the face from these,
 * so an avatar generated from a photo is just a set of traits (no photo is stored).
 */
export type AvatarTraits = {
  skin: SkinTone;
  hairColor: HairColor;
  hairStyle: HairStyle;
  facialHair: FacialHair;
  glasses: boolean;
  ageGroup: AgeGroup;
};

export const SKIN_TONES = {
  light: "#F8D5BC",
  fair: "#F0B88E",
  medium: "#D99A6C",
  tan: "#C07F52",
  brown: "#9A6240",
  dark: "#6B4128",
} as const;
export type SkinTone = keyof typeof SKIN_TONES;

export const HAIR_COLORS = {
  black: "#1E1A18",
  darkBrown: "#3A2A24",
  brown: "#6B4630",
  blonde: "#D8B26A",
  red: "#A8462A",
  gray: "#A7ABB2",
  white: "#E3E5E8",
} as const;
export type HairColor = keyof typeof HAIR_COLORS;

export const HAIR_STYLES = ["short", "spiky", "curly", "long", "bun", "pigtails", "bald"] as const;
export type HairStyle = (typeof HAIR_STYLES)[number];

export const FACIAL_HAIR = ["none", "stubble", "mustache", "beard"] as const;
export type FacialHair = (typeof FACIAL_HAIR)[number];

export const AGE_GROUPS = ["child", "adult", "senior"] as const;
export type AgeGroup = (typeof AGE_GROUPS)[number];

export const LABELS: Record<string, string> = {
  light: "Light",
  fair: "Fair",
  medium: "Medium",
  tan: "Tan",
  brown: "Brown",
  dark: "Dark",
  black: "Black",
  darkBrown: "Dark brown",
  blonde: "Blonde",
  red: "Red",
  gray: "Gray",
  white: "White",
  short: "Short",
  spiky: "Spiky",
  curly: "Curly",
  long: "Long",
  bun: "Bun",
  pigtails: "Pigtails",
  bald: "Bald",
  none: "None",
  stubble: "Stubble",
  mustache: "Mustache",
  beard: "Beard",
  child: "Child",
  adult: "Adult",
  senior: "Senior",
};

/** Sensible starting traits for someone without a generated avatar, based on age and relation. */
export function defaultTraits(member: { age?: number; relation?: string }): AvatarTraits {
  const relation = member.relation ?? "";
  const female = /mother|wife|spouse|daughter|sister|grandmother|girl/i.test(relation);
  const ageGroup: AgeGroup =
    member.age !== undefined && member.age <= 12
      ? "child"
      : (member.age ?? 0) >= 60 || /grand|^mother$|^father$/i.test(relation)
        ? "senior"
        : "adult";
  return {
    skin: ageGroup === "child" ? "light" : "fair",
    hairColor: ageGroup === "senior" ? "gray" : "darkBrown",
    hairStyle: ageGroup === "senior" && female ? "bun" : female ? (ageGroup === "child" ? "pigtails" : "long") : "short",
    facialHair: "none",
    glasses: ageGroup === "senior",
    ageGroup,
  };
}

// ---- Saved avatars (per family member) ------------------------------------------------------

const STORE_KEY = "avatar_traits_v1";
let avatars: Record<string, AvatarTraits> = {};
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

async function persist() {
  const raw = JSON.stringify(avatars);
  try {
    if (Platform.OS === "web") globalThis.localStorage?.setItem(STORE_KEY, raw);
    else await SecureStore.setItemAsync(STORE_KEY, raw);
  } catch {
    // Storage unavailable (private browsing, unsupported build) — the avatar lasts for this session only.
  }
}

async function load() {
  try {
    const raw =
      Platform.OS === "web" ? globalThis.localStorage?.getItem(STORE_KEY) : await SecureStore.getItemAsync(STORE_KEY);
    if (raw) {
      avatars = { ...JSON.parse(raw), ...avatars };
      emit();
    }
  } catch {
    // Nothing saved yet, or storage unavailable.
  }
}
load();

export function saveAvatar(memberId: string, traits: AvatarTraits) {
  avatars = { ...avatars, [memberId]: traits };
  emit();
  persist();
}

export function removeAvatar(memberId: string) {
  const { [memberId]: _removed, ...rest } = avatars;
  avatars = rest;
  emit();
  persist();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** The member's generated avatar traits, or undefined if they still use the default character. */
export function useAvatarTraits(memberId: string): AvatarTraits | undefined {
  return useSyncExternalStore(
    subscribe,
    () => avatars[memberId],
    () => avatars[memberId],
  );
}
