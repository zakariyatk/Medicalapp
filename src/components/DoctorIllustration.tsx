import React from "react";
import Svg, { Path, Circle, Rect, Ellipse } from "react-native-svg";

const PALETTE = {
  skin: "#F0B88E",
  skinShade: "#E0A274",
  hair: "#2B2420",
  coat: "#E4F2EC",
  coatShade: "#CFE6DC",
  shirt: "#2E5D7D",
  pants: "#1C2E57",
  shoes: "#13203F",
  steth: "#3C4A5C",
};

export default function DoctorIllustration({ width = 220, height = 320 }: { width?: number; height?: number }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 220 320" fill="none">
      {/* shadow */}
      <Ellipse cx="110" cy="308" rx="58" ry="9" fill="#0A1636" opacity={0.25} />

      {/* legs */}
      <Rect x="78" y="192" width="30" height="96" rx="14" fill={PALETTE.pants} />
      <Rect x="112" y="192" width="30" height="96" rx="14" fill={PALETTE.pants} />
      {/* shoes */}
      <Rect x="72" y="280" width="40" height="16" rx="8" fill={PALETTE.shoes} />
      <Rect x="108" y="280" width="40" height="16" rx="8" fill={PALETTE.shoes} />

      {/* left arm (viewer's left), relaxed at side */}
      <Path
        d="M78 118 Q56 140 58 178 Q59 196 72 200 L84 195 Q72 180 74 155 Q76 130 86 115 Z"
        fill={PALETTE.coat}
      />
      <Circle cx="66" cy="194" r="10" fill={PALETTE.skin} />

      {/* torso / open coat */}
      <Path
        d="M72 110 L72 206 Q72 216 82 216 L138 216 Q148 216 148 206 L148 110 Q148 84 120 76 L110 92 L100 76 Q72 84 72 110 Z"
        fill={PALETTE.coat}
      />
      {/* coat lapel shading */}
      <Path d="M72 110 Q72 84 100 76 L108 90 L82 106 Q74 112 72 128 Z" fill={PALETTE.coatShade} opacity={0.6} />

      {/* shirt under coat */}
      <Path d="M99 82 L121 82 L116 170 L104 170 Z" fill={PALETTE.shirt} />

      {/* stethoscope */}
      <Path
        d="M101 86 Q90 100 93 118 Q95 130 110 131 Q125 130 127 118 Q130 100 119 86"
        stroke={PALETTE.steth}
        strokeWidth={3}
        fill="none"
        strokeLinecap="round"
      />
      <Circle cx="110" cy="134" r="6" fill={PALETTE.steth} />

      {/* right arm (viewer's right), raised gesturing */}
      <Path
        d="M142 112 Q166 118 168 142 Q169 158 155 166 L144 154 Q156 144 150 124 Q147 116 138 112 Z"
        fill={PALETTE.coat}
      />
      <Circle cx="159" cy="160" r="11" fill={PALETTE.skin} />
      <Path d="M153 154 L166 166 M159 150 L170 161 M148 159 L160 170" stroke={PALETTE.skinShade} strokeWidth={1.5} strokeLinecap="round" />

      {/* neck */}
      <Rect x="100" y="62" width="20" height="24" rx="6" fill={PALETTE.skin} />

      {/* head */}
      <Circle cx="110" cy="50" r="27" fill={PALETTE.skin} />
      <Circle cx="83" cy="52" r="4.5" fill={PALETTE.skin} />
      <Circle cx="137" cy="52" r="4.5" fill={PALETTE.skin} />

      {/* hair */}
      <Path
        d="M83 44 Q81 18 110 17 Q139 18 137 44 Q134 32 124 30 Q117 38 110 30 Q103 38 96 30 Q86 32 83 44 Z"
        fill={PALETTE.hair}
      />

      {/* face */}
      <Ellipse cx="99" cy="51" rx="2.6" ry="3.4" fill="#2B2420" />
      <Ellipse cx="121" cy="51" rx="2.6" ry="3.4" fill="#2B2420" />
      <Path d="M94 42 Q99 39 104 41 M116 41 Q121 39 126 42" stroke="#2B2420" strokeWidth={1.6} strokeLinecap="round" />
      <Path d="M101 61 Q110 66 119 61" stroke="#8A4A2E" strokeWidth={2} strokeLinecap="round" fill="none" />
      <Path d="M100 58 Q110 61 120 58" stroke="#2B2420" strokeWidth={2.2} strokeLinecap="round" fill="none" />
    </Svg>
  );
}
