import React from "react";
import { View } from "react-native";
import Svg, { Path, Circle, Rect, Ellipse, Line } from "react-native-svg";
import AvatarFace from "./AvatarFace";
import { useAvatarTraits } from "../lib/avatar";

export type IllustrationProps = { width?: number; height?: number };

const SKIN = "#F0B88E";
const SKIN_CHILD = "#F3C3A0";
const HAIR_DARK = "#2B2420";
const HAIR_GRAY = "#D7DADF";

function Shadow() {
  return <Ellipse cx="110" cy="308" rx="56" ry="9" fill="#1C2430" opacity={0.08} />;
}

/** Adult man — father / account owner figure. */
export function FatherIllustration({ width = 200, height = 300 }: IllustrationProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 220 320" fill="none">
      <Shadow />
      <Rect x="80" y="196" width="28" height="92" rx="13" fill="#24365E" />
      <Rect x="112" y="196" width="28" height="92" rx="13" fill="#24365E" />
      <Rect x="74" y="280" width="38" height="15" rx="7.5" fill="#15223D" />
      <Rect x="108" y="280" width="38" height="15" rx="7.5" fill="#15223D" />

      {/* left arm, hand on hip */}
      <Path d="M80 116 Q60 136 62 168 Q63 184 78 186 L88 178 Q76 166 78 146 Q80 128 88 116 Z" fill="#0F766E" />
      <Circle cx="69" cy="180" r="9.5" fill={SKIN} />

      {/* torso / polo shirt */}
      <Path
        d="M78 108 L78 198 Q78 208 88 208 L132 208 Q142 208 142 198 L142 108 Q142 88 120 82 L110 96 L100 82 Q78 88 78 108 Z"
        fill="#0F766E"
      />
      <Path d="M104 86 L116 86 L112 108 L108 108 Z" fill="#E8F3F0" />

      {/* right arm raised, waving */}
      <Path d="M140 112 Q160 110 166 130 Q170 146 158 156 L148 144 Q156 134 150 120 Q146 112 138 110 Z" fill="#0F766E" />
      <Circle cx="160" cy="152" r="10" fill={SKIN} />

      <Rect x="100" y="60" width="20" height="24" rx="6" fill={SKIN} />
      <Circle cx="110" cy="49" r="26" fill={SKIN} />
      <Circle cx="84" cy="51" r="4.2" fill={SKIN} />
      <Circle cx="136" cy="51" r="4.2" fill={SKIN} />
      <Path d="M84 42 Q84 16 110 15 Q136 16 136 42 Q132 30 122 29 Q116 37 110 29 Q104 37 98 29 Q88 30 84 42 Z" fill={HAIR_DARK} />
      <Ellipse cx="100" cy="50" rx="2.4" ry="3.2" fill="#2B2420" />
      <Ellipse cx="120" cy="50" rx="2.4" ry="3.2" fill="#2B2420" />
      <Path d="M95 42 Q100 39 105 41 M115 41 Q120 39 125 42" stroke="#2B2420" strokeWidth={1.5} strokeLinecap="round" />
      <Path d="M100 58 Q110 55 120 58" stroke="#8A4A2E" strokeWidth={1.8} strokeLinecap="round" fill="none" />
      <Path d="M100 60 Q110 65 120 60" stroke="#2B2420" strokeWidth={2} strokeLinecap="round" fill="none" />
    </Svg>
  );
}

/** Adult woman — mother / spouse figure. */
export function MotherIllustration({ width = 200, height = 300 }: IllustrationProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 220 320" fill="none">
      <Shadow />
      <Path d="M82 196 L80 280 Q80 288 88 288 L96 288 L100 200 Z" fill="#1E2A52" />
      <Path d="M138 196 L140 280 Q140 288 132 288 L124 288 L120 200 Z" fill="#1E2A52" />
      <Rect x="76" y="280" width="34" height="14" rx="7" fill="#15223D" />
      <Rect x="110" y="280" width="34" height="14" rx="7" fill="#15223D" />

      {/* dress / torso */}
      <Path
        d="M82 106 Q78 150 72 198 Q70 206 80 208 L140 208 Q150 206 148 198 Q142 150 138 106 Q126 92 110 92 Q94 92 82 106 Z"
        fill="#4F46E5"
      />
      <Path d="M104 90 L116 90 L112 112 L108 112 Z" fill="#EFEDFE" />
      <Path d="M82 106 Q78 150 72 198" stroke="#3E36C4" strokeWidth={2} fill="none" opacity={0.5} />

      {/* left arm at side */}
      <Path d="M82 112 Q66 132 68 160 Q69 174 80 178 L89 170 Q79 158 81 140 Q83 122 90 112 Z" fill="#4F46E5" />
      <Circle cx="73" cy="172" r="9" fill={SKIN} />

      {/* right arm raised waving */}
      <Path d="M138 112 Q156 112 161 132 Q165 146 153 155 L144 144 Q152 134 147 120 Q143 112 136 112 Z" fill="#4F46E5" />
      <Circle cx="155" cy="150" r="9.5" fill={SKIN} />

      <Rect x="101" y="64" width="18" height="22" rx="6" fill={SKIN} />
      <Circle cx="110" cy="51" r="25" fill={SKIN} />
      <Circle cx="86" cy="53" r="4" fill={SKIN} />
      <Circle cx="134" cy="53" r="4" fill={SKIN} />
      {/* long hair */}
      <Path
        d="M85 46 Q83 16 110 15 Q137 16 135 46 Q140 70 132 92 Q128 70 128 50 Q119 58 110 50 Q101 58 92 50 Q92 70 88 92 Q80 70 85 46 Z"
        fill="#3A2A24"
      />
      <Ellipse cx="101" cy="52" rx="2.3" ry="3" fill="#2B2420" />
      <Ellipse cx="119" cy="52" rx="2.3" ry="3" fill="#2B2420" />
      <Path d="M96 44 Q101 41 106 43 M114 43 Q119 41 124 44" stroke="#2B2420" strokeWidth={1.4} strokeLinecap="round" />
      <Path d="M101 60 Q110 65 119 60" stroke="#B5527A" strokeWidth={1.8} strokeLinecap="round" fill="none" />
      <Circle cx="90" cy="60" r="2.5" fill="#F2A7B5" opacity={0.6} />
      <Circle cx="130" cy="60" r="2.5" fill="#F2A7B5" opacity={0.6} />
    </Svg>
  );
}

/** Young boy — son figure (bigger head ratio, child proportions). */
export function SonIllustration({ width = 170, height = 250 }: IllustrationProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 220 320" fill="none">
      <Ellipse cx="110" cy="286" rx="46" ry="8" fill="#1C2430" opacity={0.08} />
      <Rect x="88" y="206" width="22" height="58" rx="11" fill="#1F3A68" />
      <Rect x="112" y="206" width="22" height="58" rx="11" fill="#1F3A68" />
      <Rect x="84" y="256" width="32" height="13" rx="6.5" fill="#13203F" />
      <Rect x="112" y="256" width="32" height="13" rx="6.5" fill="#13203F" />

      <Path
        d="M86 140 L86 212 Q86 220 95 220 L127 220 Q136 220 136 212 L136 140 Q136 122 118 116 L110 128 L104 116 Q86 122 86 140 Z"
        fill="#D97706"
      />

      <Path d="M86 142 Q70 156 72 180 Q73 192 84 195 L92 188 Q83 178 85 164 Q86 150 92 142 Z" fill="#D97706" />
      <Circle cx="77" cy="190" r="8.5" fill={SKIN_CHILD} />

      <Path d="M136 140 Q152 138 156 156 Q159 170 148 177 L140 168 Q147 160 143 148 Q140 140 134 140 Z" fill="#D97706" />
      <Circle cx="150" cy="172" r="9" fill={SKIN_CHILD} />

      <Rect x="101" y="100" width="18" height="20" rx="6" fill={SKIN_CHILD} />
      <Circle cx="110" cy="84" r="32" fill={SKIN_CHILD} />
      <Circle cx="80" cy="86" r="4.6" fill={SKIN_CHILD} />
      <Circle cx="140" cy="86" r="4.6" fill={SKIN_CHILD} />
      <Path d="M80 76 Q78 48 110 47 Q142 48 140 76 Q134 62 122 62 Q116 70 110 62 Q104 70 98 62 Q86 62 80 76 Z" fill={HAIR_DARK} />
      <Path d="M104 64 L100 58" stroke={HAIR_DARK} strokeWidth={4} strokeLinecap="round" />
      <Ellipse cx="97" cy="86" rx="2.6" ry="3.4" fill="#2B2420" />
      <Ellipse cx="123" cy="86" rx="2.6" ry="3.4" fill="#2B2420" />
      <Circle cx="88" cy="94" r="4" fill="#F2A7B5" opacity={0.5} />
      <Circle cx="132" cy="94" r="4" fill="#F2A7B5" opacity={0.5} />
      <Path d="M97 100 Q110 110 123 100" stroke="#8A4A2E" strokeWidth={2.2} strokeLinecap="round" fill="none" />
      <Path d="M98 102 Q110 108 122 102" stroke="#2B2420" strokeWidth={2.4} strokeLinecap="round" fill="none" />
    </Svg>
  );
}

/** Young girl — daughter figure (youngest, biggest head ratio, pigtails). */
export function DaughterIllustration({ width = 160, height = 235 }: IllustrationProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 220 320" fill="none">
      <Ellipse cx="110" cy="276" rx="42" ry="7.5" fill="#1C2430" opacity={0.08} />
      <Rect x="92" y="216" width="18" height="44" rx="9" fill="#2A2440" />
      <Rect x="112" y="216" width="18" height="44" rx="9" fill="#2A2440" />
      <Rect x="88" y="256" width="28" height="12" rx="6" fill="#6B2142" />
      <Rect x="112" y="256" width="28" height="12" rx="6" fill="#6B2142" />

      {/* dress - flares out */}
      <Path
        d="M92 150 Q84 180 76 218 Q74 226 83 227 L140 227 Q149 226 147 218 Q139 180 131 150 Q121 138 110 138 Q99 138 92 150 Z"
        fill="#BE185D"
      />
      <Path d="M104 140 L116 140 L113 155 L107 155 Z" fill="#FBD6E4" />

      <Path d="M92 150 Q78 164 80 184 Q81 194 90 198 L97 190 Q89 180 91 168 Q93 156 98 150 Z" fill="#BE185D" />
      <Circle cx="85" cy="192" r="8" fill={SKIN_CHILD} />

      <Path d="M130 150 Q144 150 148 166 Q151 178 141 184 L134 176 Q140 168 137 158 Q134 150 128 150 Z" fill="#BE185D" />
      <Circle cx="142" cy="180" r="8.5" fill={SKIN_CHILD} />

      <Rect x="102" y="112" width="16" height="18" rx="6" fill={SKIN_CHILD} />
      <Circle cx="110" cy="97" r="33" fill={SKIN_CHILD} />
      <Circle cx="79" cy="99" r="4.6" fill={SKIN_CHILD} />
      <Circle cx="141" cy="99" r="4.6" fill={SKIN_CHILD} />

      {/* hair with pigtails */}
      <Path d="M79 90 Q76 60 110 59 Q144 60 141 90 Q136 76 124 75 Q117 83 110 75 Q103 83 96 75 Q84 76 79 90 Z" fill="#3A2A24" />
      <Circle cx="68" cy="104" r="11" fill="#3A2A24" />
      <Circle cx="152" cy="104" r="11" fill="#3A2A24" />
      <Circle cx="68" cy="97" r="4" fill="#F472B6" />
      <Circle cx="152" cy="97" r="4" fill="#F472B6" />

      <Ellipse cx="97" cy="99" rx="2.7" ry="3.5" fill="#2B2420" />
      <Ellipse cx="123" cy="99" rx="2.7" ry="3.5" fill="#2B2420" />
      <Circle cx="87" cy="107" r="4.2" fill="#F2A7B5" opacity={0.55} />
      <Circle cx="133" cy="107" r="4.2" fill="#F2A7B5" opacity={0.55} />
      <Path d="M97 113 Q110 120 123 113" stroke="#8A4A2E" strokeWidth={2.2} strokeLinecap="round" fill="none" />
      <Path d="M98 115 Q110 119 122 115" stroke="#2B2420" strokeWidth={2.4} strokeLinecap="round" fill="none" />
    </Svg>
  );
}

/** Elderly woman — grandmother figure. */
export function GrandmotherIllustration({ width = 200, height = 300 }: IllustrationProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 220 320" fill="none">
      <Shadow />
      <Path d="M84 198 L82 282 Q82 290 90 290 L98 290 L102 202 Z" fill="#4B5568" />
      <Path d="M136 198 L138 282 Q138 290 130 290 L122 290 L118 202 Z" fill="#4B5568" />
      <Rect x="78" y="282" width="32" height="13" rx="6.5" fill="#333C48" />
      <Rect x="110" y="282" width="32" height="13" rx="6.5" fill="#333C48" />

      {/* long skirt + cardigan */}
      <Path
        d="M84 108 Q80 150 74 200 Q72 208 82 210 L138 210 Q148 208 146 200 Q140 150 136 108 Q124 94 110 94 Q96 94 84 108 Z"
        fill="#8B8FA3"
      />
      <Path d="M100 92 L120 92 L117 150 L103 150 Z" fill="#EDEBE3" />
      <Path d="M84 108 Q80 150 74 200" stroke="#6E7489" strokeWidth={2} fill="none" opacity={0.5} />

      <Path d="M84 114 Q68 134 70 160 Q71 174 82 178 L91 170 Q81 158 83 142 Q85 124 92 114 Z" fill="#8B8FA3" />
      <Circle cx="75" cy="172" r="9" fill={SKIN} />

      <Path d="M136 114 Q152 114 157 132 Q161 146 150 154 L142 144 Q149 136 145 122 Q142 114 134 114 Z" fill="#8B8FA3" />
      <Circle cx="153" cy="148" r="9" fill={SKIN} />

      <Rect x="101" y="66" width="18" height="22" rx="6" fill={SKIN} />
      <Circle cx="110" cy="53" r="25" fill={SKIN} />
      <Circle cx="86" cy="55" r="4" fill={SKIN} />
      <Circle cx="134" cy="55" r="4" fill={SKIN} />

      {/* gray hair in a bun */}
      <Path d="M86 48 Q84 20 110 19 Q136 20 134 48 Q130 36 121 34 Q115 42 110 34 Q105 42 99 34 Q90 36 86 48 Z" fill={HAIR_GRAY} />
      <Circle cx="110" cy="22" r="10" fill={HAIR_GRAY} />

      {/* glasses */}
      <Circle cx="100" cy="54" r="7.5" stroke="#4B5568" strokeWidth={1.6} fill="none" />
      <Circle cx="120" cy="54" r="7.5" stroke="#4B5568" strokeWidth={1.6} fill="none" />
      <Line x1="107.5" y1="54" x2="112.5" y2="54" stroke="#4B5568" strokeWidth={1.6} />

      <Ellipse cx="100" cy="54" rx="2.2" ry="2.8" fill="#2B2420" />
      <Ellipse cx="120" cy="54" rx="2.2" ry="2.8" fill="#2B2420" />
      <Path d="M101 63 Q110 67 119 63" stroke="#8A4A2E" strokeWidth={1.8} strokeLinecap="round" fill="none" />
      <Path d="M101 65 Q110 70 119 65" stroke="#2B2420" strokeWidth={2} strokeLinecap="round" fill="none" />
    </Svg>
  );
}

/** Small bust/face illustrations — same characters, cropped for avatar-sized circles (lists, chips). */
function FatherFace({ size = 44 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Rect x="0" y="74" width="100" height="26" fill="#0F766E" />
      <Path d="M41 72 L41 56 L59 56 L59 72 Z" fill={SKIN} />
      <Circle cx="50" cy="42" r="26" fill={SKIN} />
      <Path d="M24 40 Q24 14 50 13 Q76 14 76 40 Q71 28 61 27 Q55 35 50 27 Q45 35 39 27 Q29 28 24 40 Z" fill={HAIR_DARK} />
      <Ellipse cx="40" cy="44" rx="2.8" ry="3.6" fill="#2B2420" />
      <Ellipse cx="60" cy="44" rx="2.8" ry="3.6" fill="#2B2420" />
      <Path d="M40 54 Q50 59 60 54" stroke="#2B2420" strokeWidth={2.4} strokeLinecap="round" fill="none" />
    </Svg>
  );
}

function MotherFace({ size = 44 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Rect x="0" y="76" width="100" height="24" fill="#4F46E5" />
      <Path d="M42 72 L42 58 L58 58 L58 72 Z" fill={SKIN} />
      <Circle cx="50" cy="42" r="25" fill={SKIN} />
      <Path
        d="M26 38 Q24 12 50 11 Q76 12 74 38 Q78 58 70 76 Q68 58 68 42 Q60 49 50 42 Q40 49 32 42 Q32 58 30 76 Q22 58 26 38 Z"
        fill="#3A2A24"
      />
      <Ellipse cx="41" cy="44" rx="2.6" ry="3.4" fill="#2B2420" />
      <Ellipse cx="59" cy="44" rx="2.6" ry="3.4" fill="#2B2420" />
      <Path d="M41 54 Q50 58 59 54" stroke="#B5527A" strokeWidth={2.2} strokeLinecap="round" fill="none" />
    </Svg>
  );
}

function SonFace({ size = 44 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Rect x="0" y="78" width="100" height="22" fill="#D97706" />
      <Path d="M43 74 L43 62 L57 62 L57 74 Z" fill={SKIN_CHILD} />
      <Circle cx="50" cy="44" r="29" fill={SKIN_CHILD} />
      <Path d="M20 42 Q18 14 50 13 Q82 14 80 42 Q74 28 62 28 Q56 36 50 28 Q44 36 38 28 Q26 28 20 42 Z" fill={HAIR_DARK} />
      <Path d="M44 22 L40 16" stroke={HAIR_DARK} strokeWidth={4.5} strokeLinecap="round" />
      <Ellipse cx="38" cy="46" rx="3" ry="3.8" fill="#2B2420" />
      <Ellipse cx="62" cy="46" rx="3" ry="3.8" fill="#2B2420" />
      <Circle cx="30" cy="54" r="4.4" fill="#F2A7B5" opacity={0.5} />
      <Circle cx="70" cy="54" r="4.4" fill="#F2A7B5" opacity={0.5} />
      <Path d="M39 58 Q50 65 61 58" stroke="#2B2420" strokeWidth={2.6} strokeLinecap="round" fill="none" />
    </Svg>
  );
}

function DaughterFace({ size = 44 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Rect x="0" y="80" width="100" height="20" fill="#BE185D" />
      <Path d="M44 76 L44 65 L56 65 L56 76 Z" fill={SKIN_CHILD} />
      <Circle cx="50" cy="47" r="29" fill={SKIN_CHILD} />
      <Path d="M18 45 Q16 16 50 15 Q84 16 82 45 Q75 30 62 29 Q55 38 50 29 Q45 38 38 29 Q25 30 18 45 Z" fill="#3A2A24" />
      <Circle cx="12" cy="56" r="9.5" fill="#3A2A24" />
      <Circle cx="88" cy="56" r="9.5" fill="#3A2A24" />
      <Circle cx="12" cy="50" r="3.4" fill="#F472B6" />
      <Circle cx="88" cy="50" r="3.4" fill="#F472B6" />
      <Ellipse cx="38" cy="49" rx="3" ry="3.8" fill="#2B2420" />
      <Ellipse cx="62" cy="49" rx="3" ry="3.8" fill="#2B2420" />
      <Circle cx="30" cy="57" r="4.4" fill="#F2A7B5" opacity={0.55} />
      <Circle cx="70" cy="57" r="4.4" fill="#F2A7B5" opacity={0.55} />
      <Path d="M39 61 Q50 67 61 61" stroke="#2B2420" strokeWidth={2.6} strokeLinecap="round" fill="none" />
    </Svg>
  );
}

function GrandmotherFace({ size = 44 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Rect x="0" y="76" width="100" height="24" fill="#8B8FA3" />
      <Path d="M42 72 L42 60 L58 60 L58 72 Z" fill={SKIN} />
      <Circle cx="50" cy="44" r="25" fill={SKIN} />
      <Path d="M27 42 Q25 15 50 14 Q75 15 73 42 Q68 29 59 27 Q53 36 50 27 Q47 36 41 27 Q32 29 27 42 Z" fill={HAIR_GRAY} />
      <Circle cx="50" cy="16" r="9" fill={HAIR_GRAY} />
      <Circle cx="39" cy="46" r="7" stroke="#4B5568" strokeWidth={1.8} fill="none" />
      <Circle cx="61" cy="46" r="7" stroke="#4B5568" strokeWidth={1.8} fill="none" />
      <Line x1="46" y1="46" x2="54" y2="46" stroke="#4B5568" strokeWidth={1.8} />
      <Ellipse cx="39" cy="46" rx="2.3" ry="3" fill="#2B2420" />
      <Ellipse cx="61" cy="46" rx="2.3" ry="3" fill="#2B2420" />
      <Path d="M40 56 Q50 60 60 56" stroke="#2B2420" strokeWidth={2.2} strokeLinecap="round" fill="none" />
    </Svg>
  );
}

type MemberLike = { id: string; age?: number; relation?: string; color?: string };

type Kind = "father" | "mother" | "son" | "daughter" | "grandmother";

const KIND_BY_ID: Record<string, Kind> = {
  harish: "father",
  nisha: "mother",
  aarav: "son",
  kavya: "daughter",
  devki: "grandmother",
};

/** Resolves a family member to an illustration kind, with a sensible fallback by age/relation. */
function resolveKind(member: MemberLike): Kind {
  if (KIND_BY_ID[member.id]) return KIND_BY_ID[member.id];
  if (member.age !== undefined && member.age <= 12) {
    return /daughter|girl/i.test(member.relation ?? "") ? "daughter" : "son";
  }
  if (/grand/i.test(member.relation ?? "")) return "grandmother";
  if (/mother|wife|spouse/i.test(member.relation ?? "")) return "mother";
  return "father";
}

/** Renders a family member's full-view cartoon illustration, picking the right character for who they are. */
export function MemberIllustration({ member, width, height }: IllustrationProps & { member: MemberLike }) {
  const traits = useAvatarTraits(member.id);
  if (traits) {
    // An avatar generated from a photo is a head-and-shoulders drawing; fit it to the space.
    const size = Math.min(width ?? 200, height ?? 300);
    return <AvatarFace traits={traits} shirt={member.color} size={size} />;
  }
  switch (resolveKind(member)) {
    case "mother":
      return <MotherIllustration width={width} height={height} />;
    case "son":
      return <SonIllustration width={width} height={height} />;
    case "daughter":
      return <DaughterIllustration width={width} height={height} />;
    case "grandmother":
      return <GrandmotherIllustration width={width} height={height} />;
    case "father":
    default:
      return <FatherIllustration width={width} height={height} />;
  }
}

function MemberFace({ member, size }: { member: MemberLike; size: number }) {
  switch (resolveKind(member)) {
    case "mother":
      return <MotherFace size={size} />;
    case "son":
      return <SonFace size={size} />;
    case "daughter":
      return <DaughterFace size={size} />;
    case "grandmother":
      return <GrandmotherFace size={size} />;
    case "father":
    default:
      return <FatherFace size={size} />;
  }
}

/** Small circular cartoon-avatar, same character as the full illustration — for list rows, chips, headers. */
export function MemberAvatar({ member, size = 48 }: { member: MemberLike; size?: number }) {
  const traits = useAvatarTraits(member.id);
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        overflow: "hidden",
        backgroundColor: member.color ? `${member.color}1F` : "#EDEFF2",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {traits ? <AvatarFace traits={traits} shirt={member.color} size={size} /> : <MemberFace member={member} size={size} />}
    </View>
  );
}
