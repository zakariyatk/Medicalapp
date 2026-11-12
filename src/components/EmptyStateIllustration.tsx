import React from "react";
import Svg, { Path, Circle, Rect, Ellipse } from "react-native-svg";

/** Friendly "nothing here yet" illustration — a clipboard with a search glass, for empty record lists. */
export default function EmptyStateIllustration({ size = 120 }: { size?: number }) {
  return (
    <Svg width={size} height={size * 0.82} viewBox="0 0 160 132" fill="none">
      <Ellipse cx="78" cy="122" rx="52" ry="8" fill="#1C2430" opacity={0.06} />
      <Rect x="38" y="18" width="72" height="92" rx="10" fill="#EEF1F5" stroke="#D7DCE3" strokeWidth={2} />
      <Rect x="58" y="10" width="32" height="14" rx="6" fill="#B9C2CE" />
      <Rect x="50" y="38" width="48" height="6" rx="3" fill="#D7DCE3" />
      <Rect x="50" y="52" width="48" height="6" rx="3" fill="#D7DCE3" />
      <Rect x="50" y="66" width="32" height="6" rx="3" fill="#D7DCE3" />
      <Circle cx="110" cy="84" r="23" fill="#FFFFFF" stroke="#9AA6B2" strokeWidth={3.5} />
      <Circle cx="110" cy="84" r="12" fill="#F6F7F9" />
      <Path d="M127 101 L140 114" stroke="#9AA6B2" strokeWidth={6} strokeLinecap="round" />
    </Svg>
  );
}
