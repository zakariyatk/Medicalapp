import React from "react";
import Svg, { Path, Circle, Rect, Ellipse, Line, G } from "react-native-svg";
import { HAIR_COLORS, SKIN_TONES, type AvatarTraits } from "../lib/avatar";

/**
 * Cartoon head-and-shoulders drawn from avatar traits, in the same flat style as the family
 * illustrations. Drawn on a 100×100 grid so it fills a circular avatar.
 */
export default function AvatarFace({
  traits,
  shirt = "#0F766E",
  size = 48,
}: {
  traits: AvatarTraits;
  shirt?: string;
  size?: number;
}) {
  const skin = SKIN_TONES[traits.skin];
  const hair = HAIR_COLORS[traits.hairColor];
  const child = traits.ageGroup === "child";
  // Children get a bigger, lower head; adults a slightly smaller one.
  const r = child ? 29 : 25;
  const cy = child ? 46 : 43;
  const top = cy - r;
  const eyeY = cy + 2;
  const eyeDx = child ? 12 : 10;
  const mouthY = cy + (child ? 13 : 12);

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {/* shoulders and neck */}
      <Path d={`M8 100 Q10 ${cy + r + 6} 50 ${cy + r + 4} Q90 ${cy + r + 6} 92 100 Z`} fill={shirt} />
      <Rect x="42" y={cy + r - 8} width="16" height="12" rx="5" fill={skin} />

      {/* hair that sits behind the head */}
      {traits.hairStyle === "long" && (
        <Path
          d={`M${50 - r - 2} ${cy - 4} Q${50 - r - 4} ${top - 2} 50 ${top - 3} Q${50 + r + 4} ${top - 2} ${50 + r + 2} ${cy - 4} Q${50 + r + 6} ${cy + 22} ${50 + r - 2} ${cy + r + 8} L${50 - r + 2} ${cy + r + 8} Q${50 - r - 6} ${cy + 22} ${50 - r - 2} ${cy - 4} Z`}
          fill={hair}
        />
      )}
      {traits.hairStyle === "bun" && <Circle cx="50" cy={top - 2} r="9" fill={hair} />}
      {traits.hairStyle === "pigtails" && (
        <G>
          <Circle cx={50 - r - 7} cy={cy + 8} r="9.5" fill={hair} />
          <Circle cx={50 + r + 7} cy={cy + 8} r="9.5" fill={hair} />
          <Circle cx={50 - r - 6} cy={cy + 1} r="3.2" fill="#F472B6" />
          <Circle cx={50 + r + 6} cy={cy + 1} r="3.2" fill="#F472B6" />
        </G>
      )}
      {traits.hairStyle === "curly" && (
        <G>
          {[-22, -11, 0, 11, 22].map((dx) => (
            <Circle key={dx} cx={50 + dx} cy={top + 3 - (Math.abs(dx) < 15 ? 3 : -4)} r="10" fill={hair} />
          ))}
          <Circle cx={50 - r + 1} cy={cy - 4} r="8" fill={hair} />
          <Circle cx={50 + r - 1} cy={cy - 4} r="8" fill={hair} />
        </G>
      )}

      {/* ears and head */}
      <Circle cx={50 - r} cy={cy + 2} r="4" fill={skin} />
      <Circle cx={50 + r} cy={cy + 2} r="4" fill={skin} />
      <Circle cx="50" cy={cy} r={r} fill={skin} />

      {/* hair on top of the head */}
      {(traits.hairStyle === "short" || traits.hairStyle === "long" || traits.hairStyle === "bun" || traits.hairStyle === "pigtails") && (
        <Path
          d={`M${50 - r} ${cy - 2} Q${50 - r} ${top - 1} 50 ${top - 2} Q${50 + r} ${top - 1} ${50 + r} ${cy - 2} Q${50 + r - 5} ${top + 13} ${50 + 11} ${top + 13} Q${50 + 5} ${top + 21} 50 ${top + 13} Q${50 - 5} ${top + 21} ${50 - 11} ${top + 13} Q${50 - r + 5} ${top + 13} ${50 - r} ${cy - 2} Z`}
          fill={hair}
        />
      )}
      {traits.hairStyle === "spiky" && (
        <Path
          d={`M${50 - r} ${cy - 2} L${50 - r + 3} ${top + 4} L${50 - 15} ${top + 1} L${50 - 10} ${top - 7} L${50 - 3} ${top} L${50 + 4} ${top - 8} L${50 + 9} ${top} L${50 + 17} ${top - 5} L${50 + r - 3} ${top + 6} L${50 + r} ${cy - 2} Q${50 + r - 6} ${top + 13} 50 ${top + 13} Q${50 - r + 6} ${top + 13} ${50 - r} ${cy - 2} Z`}
          fill={hair}
        />
      )}
      {traits.hairStyle === "curly" && (
        <Path d={`M${50 - r + 2} ${cy - 6} Q50 ${top + 6} ${50 + r - 2} ${cy - 6} Q50 ${top + 14} ${50 - r + 2} ${cy - 6} Z`} fill={hair} />
      )}
      {traits.hairStyle === "bald" && traits.ageGroup !== "child" && (
        <G>
          <Path d={`M${50 - r + 1} ${cy + 2} Q${50 - r} ${cy - 10} ${50 - r + 6} ${cy - 13}`} stroke={hair} strokeWidth={4} strokeLinecap="round" fill="none" />
          <Path d={`M${50 + r - 1} ${cy + 2} Q${50 + r} ${cy - 10} ${50 + r - 6} ${cy - 13}`} stroke={hair} strokeWidth={4} strokeLinecap="round" fill="none" />
        </G>
      )}

      {/* brows, eyes */}
      {traits.ageGroup !== "child" && (
        <Path
          d={`M${50 - eyeDx - 5} ${eyeY - 7} Q${50 - eyeDx} ${eyeY - 9.5} ${50 - eyeDx + 5} ${eyeY - 7.5} M${50 + eyeDx - 5} ${eyeY - 7.5} Q${50 + eyeDx} ${eyeY - 9.5} ${50 + eyeDx + 5} ${eyeY - 7}`}
          stroke={traits.hairColor === "white" || traits.hairColor === "gray" ? "#8B8F96" : "#2B2420"}
          strokeWidth={1.6}
          strokeLinecap="round"
          fill="none"
        />
      )}
      <Ellipse cx={50 - eyeDx} cy={eyeY} rx={child ? 3 : 2.7} ry={child ? 3.8 : 3.5} fill="#2B2420" />
      <Ellipse cx={50 + eyeDx} cy={eyeY} rx={child ? 3 : 2.7} ry={child ? 3.8 : 3.5} fill="#2B2420" />

      {traits.glasses && (
        <G>
          <Circle cx={50 - eyeDx} cy={eyeY} r="7" stroke="#3B4452" strokeWidth={1.8} fill="none" />
          <Circle cx={50 + eyeDx} cy={eyeY} r="7" stroke="#3B4452" strokeWidth={1.8} fill="none" />
          <Line x1={50 - eyeDx + 7} y1={eyeY} x2={50 + eyeDx - 7} y2={eyeY} stroke="#3B4452" strokeWidth={1.8} />
        </G>
      )}

      {/* cheeks for children */}
      {child && (
        <G>
          <Circle cx={50 - 20} cy={eyeY + 8} r="4.4" fill="#F2A7B5" opacity={0.5} />
          <Circle cx={50 + 20} cy={eyeY + 8} r="4.4" fill="#F2A7B5" opacity={0.5} />
        </G>
      )}

      {/* facial hair, drawn before the mouth so the smile stays visible */}
      {traits.facialHair === "beard" && (
        <Path
          d={`M${50 - r + 3} ${cy + 4} Q${50 - r + 4} ${cy + r + 2} 50 ${cy + r + 3} Q${50 + r - 4} ${cy + r + 2} ${50 + r - 3} ${cy + 4} Q${50 + 14} ${cy + 10} 50 ${mouthY - 4} Q${50 - 14} ${cy + 10} ${50 - r + 3} ${cy + 4} Z`}
          fill={hair}
        />
      )}
      {traits.facialHair === "stubble" && (
        <Path
          d={`M${50 - r + 4} ${cy + 6} Q${50 - r + 6} ${cy + r} 50 ${cy + r + 1} Q${50 + r - 6} ${cy + r} ${50 + r - 4} ${cy + 6} Q50 ${mouthY + 2} ${50 - r + 4} ${cy + 6} Z`}
          fill={hair}
          opacity={0.28}
        />
      )}
      {(traits.facialHair === "mustache" || traits.facialHair === "beard") && (
        <Path d={`M${50 - 9} ${mouthY - 2} Q50 ${mouthY - 7} ${50 + 9} ${mouthY - 2} Q50 ${mouthY - 3} ${50 - 9} ${mouthY - 2} Z`} fill={hair} stroke={hair} strokeWidth={1.5} />
      )}
      <Path
        d={`M${50 - 9} ${mouthY} Q50 ${mouthY + 6} ${50 + 9} ${mouthY}`}
        stroke={traits.facialHair === "beard" ? "#F5EDE6" : "#2B2420"}
        strokeWidth={2.4}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}
