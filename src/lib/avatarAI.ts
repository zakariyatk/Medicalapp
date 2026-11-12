import { Platform } from "react-native";
import {
  AGE_GROUPS,
  FACIAL_HAIR,
  HAIR_COLORS,
  HAIR_STYLES,
  SKIN_TONES,
  type AvatarTraits,
  type HairColor,
  type SkinTone,
} from "./avatar";

/**
 * Turns a real photo into cartoon-avatar traits.
 *
 * 1. If EXPO_PUBLIC_SUPABASE_URL is set, the photo goes to the `generate-avatar` Supabase Edge
 *    Function (supabase/functions/generate-avatar), which asks Claude to describe the visible
 *    features and returns them as AvatarTraits. The photo is not stored.
 * 2. Otherwise, in a web browser, the colours are estimated on the device from the photo's pixels
 *    (skin tone from the centre, hair colour from the top). Style, beard and glasses keep the
 *    starting values and the person adjusts them on the next screen.
 * 3. Otherwise (native build without a backend) the starting values come back unchanged.
 */
export type AvatarResult = { traits: AvatarTraits; source: "ai" | "estimate" | "manual" };

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export async function generateAvatarFromPhoto(
  photo: { uri: string; base64?: string | null; mimeType?: string | null },
  start: AvatarTraits,
): Promise<AvatarResult> {
  if (SUPABASE_URL && photo.base64) {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/generate-avatar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(SUPABASE_ANON_KEY ? { Authorization: `Bearer ${SUPABASE_ANON_KEY}` } : {}),
      },
      body: JSON.stringify({ image: photo.base64, mediaType: photo.mimeType ?? "image/jpeg" }),
    });
    if (!res.ok) throw new Error(`Avatar service returned ${res.status}`);
    return { traits: sanitize(await res.json(), start), source: "ai" };
  }

  if (Platform.OS === "web") {
    try {
      const colours = await estimateColoursOnWeb(photo.uri);
      return { traits: { ...start, ...colours }, source: "estimate" };
    } catch {
      // Fall through to the starting values.
    }
  }
  return { traits: start, source: "manual" };
}

/** Keeps only known values, so a bad response can never break drawing. */
function sanitize(raw: Partial<Record<keyof AvatarTraits, unknown>>, start: AvatarTraits): AvatarTraits {
  const pick = <T extends string>(value: unknown, allowed: readonly T[], fallback: T): T =>
    allowed.includes(value as T) ? (value as T) : fallback;
  return {
    skin: pick(raw.skin, Object.keys(SKIN_TONES) as SkinTone[], start.skin),
    hairColor: pick(raw.hairColor, Object.keys(HAIR_COLORS) as HairColor[], start.hairColor),
    hairStyle: pick(raw.hairStyle, HAIR_STYLES, start.hairStyle),
    facialHair: pick(raw.facialHair, FACIAL_HAIR, start.facialHair),
    glasses: typeof raw.glasses === "boolean" ? raw.glasses : start.glasses,
    ageGroup: pick(raw.ageGroup, AGE_GROUPS, start.ageGroup),
  };
}

// ---- On-device colour estimate (web only) ----------------------------------------------------

type RGB = [number, number, number];

function hexToRgb(hex: string): RGB {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function nearest<K extends string>(rgb: RGB, palette: Record<K, string>): K {
  let best = Object.keys(palette)[0] as K;
  let bestDist = Infinity;
  for (const key of Object.keys(palette) as K[]) {
    const [r, g, b] = hexToRgb(palette[key]);
    const d = (r - rgb[0]) ** 2 + (g - rgb[1]) ** 2 + (b - rgb[2]) ** 2;
    if (d < bestDist) {
      bestDist = d;
      best = key;
    }
  }
  return best;
}

function median(pixels: RGB[]): RGB | null {
  if (pixels.length === 0) return null;
  const channel = (i: 0 | 1 | 2) => pixels.map((p) => p[i]).sort((a, b) => a - b)[Math.floor(pixels.length / 2)];
  return [channel(0), channel(1), channel(2)];
}

function sample(data: Uint8ClampedArray, size: number, x0: number, x1: number, y0: number, y1: number, keep: (p: RGB) => boolean) {
  const out: RGB[] = [];
  for (let y = Math.floor(y0 * size); y < Math.floor(y1 * size); y++) {
    for (let x = Math.floor(x0 * size); x < Math.floor(x1 * size); x++) {
      const i = (y * size + x) * 4;
      const p: RGB = [data[i], data[i + 1], data[i + 2]];
      if (keep(p)) out.push(p);
    }
  }
  return out;
}

const nearSkin = (p: RGB, skin: RGB) => (p[0] - skin[0]) ** 2 + (p[1] - skin[1]) ** 2 + (p[2] - skin[2]) ** 2 < 30 ** 2;

const looksLikeSkin = ([r, g, b]: RGB) => r > 60 && r > g && g > b * 0.85 && r - b > 15;

async function estimateColoursOnWeb(uri: string): Promise<{ skin?: SkinTone; hairColor?: HairColor }> {
  const img = new window.Image();
  img.crossOrigin = "anonymous";
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("Could not read the photo"));
    img.src = uri;
  });

  // Work on a small square crop of the centre, where a portrait's face usually is.
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return {};
  const side = Math.min(img.width, img.height);
  ctx.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size);
  const { data } = ctx.getImageData(0, 0, size, size);

  // The background is whatever fills the top corners; leave it out of the hair sample.
  const background = median([
    ...sample(data, size, 0, 0.12, 0, 0.12, () => true),
    ...sample(data, size, 0.88, 1, 0, 0.12, () => true),
  ]);
  const notBackground = (p: RGB) =>
    !background || (p[0] - background[0]) ** 2 + (p[1] - background[1]) ** 2 + (p[2] - background[2]) ** 2 > 60 ** 2;

  const skinRgb = median(sample(data, size, 0.35, 0.65, 0.35, 0.65, looksLikeSkin));
  const hairRgb = median(
    sample(data, size, 0.25, 0.75, 0.02, 0.3, (p) => notBackground(p) && (!skinRgb || !nearSkin(p, skinRgb))),
  );
  return {
    ...(skinRgb ? { skin: nearest(skinRgb, SKIN_TONES) } : {}),
    ...(hairRgb ? { hairColor: nearest(hairRgb, HAIR_COLORS) } : {}),
  };
}
