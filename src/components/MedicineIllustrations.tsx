import React from "react";
import Svg, { Path, Circle, Rect, Ellipse, Line, G } from "react-native-svg";

type ArtProps = { size?: number };

/** Antibiotic / generic capsule — two-tone pill, tilted for a little life. */
export function CapsuleIllustration({ size = 64 }: ArtProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <Ellipse cx="50" cy="86" rx="28" ry="6" fill="#1C2430" opacity={0.08} />
      <G transform="rotate(-28 50 50)">
        <Rect x="18" y="37" width="64" height="27" rx="13.5" fill="#0F766E" />
        <Path d="M50 37.5 H68.5 A13.5 13.5 0 0 1 68.5 63.5 H50 Z" fill="#E8F3F0" />
        <Line x1="50" y1="37.5" x2="50" y2="63.5" stroke="#0B5B55" strokeWidth={1.4} />
      </G>
      <Circle cx="32" cy="28" r="3.2" fill="#FFFFFF" opacity={0.75} />
      <Circle cx="70" cy="66" r="2" fill="#0F766E" opacity={0.2} />
    </Svg>
  );
}

/** Round fever/pain tablet, sitting on a soft foil-tinted backing. */
export function TabletIllustration({ size = 64 }: ArtProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <Ellipse cx="50" cy="86" rx="28" ry="6" fill="#1C2430" opacity={0.08} />
      <Circle cx="50" cy="46" r="31" fill="#FBD9E3" />
      <Circle cx="50" cy="46" r="23" fill="#FFFFFF" />
      <Line x1="31" y1="46" x2="69" y2="46" stroke="#F0B9CB" strokeWidth={3.2} strokeLinecap="round" />
      <Circle cx="39" cy="35" r="3.6" fill="#FDEEF2" />
    </Svg>
  );
}

/** Oral-rehydration sachet — foil pouch with a water droplet. */
export function SachetIllustration({ size = 64 }: ArtProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <Ellipse cx="50" cy="90" rx="25" ry="5.5" fill="#1C2430" opacity={0.08} />
      <Rect x="41" y="16" width="18" height="10" rx="3" fill="#3E36C4" />
      <Path
        d="M32 26 H68 L74 38 V78 A7 7 0 0 1 67 85 H33 A7 7 0 0 1 26 78 V38 Z"
        fill="#4F46E5"
      />
      <Path d="M32 26 H68 L74 38 H26 Z" fill="#6E64F0" />
      <Path
        d="M50 44 Q58 55 58 63 A8 8 0 0 1 42 63 Q42 55 50 44 Z"
        fill="#FFFFFF"
        opacity={0.92}
      />
      <Circle cx="45" cy="56" r="2.4" fill="#C7C3FA" opacity={0.6} />
    </Svg>
  );
}

/** Picks the right illustrated medicine art by medicine id, falling back to a capsule. */
export function MedicineArt({ medicineId, size = 64 }: { medicineId: string; size?: number }) {
  if (medicineId === "paracetamol") return <TabletIllustration size={size} />;
  if (medicineId === "ors") return <SachetIllustration size={size} />;
  return <CapsuleIllustration size={size} />;
}
