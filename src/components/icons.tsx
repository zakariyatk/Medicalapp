import React from "react";
import Svg, { Path, Circle, Line, Rect } from "react-native-svg";
import { colors } from "../theme";

type IconProps = { size?: number; color?: string; strokeWidth?: number };

export function BackIcon({ size = 16, color = colors.text, strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M15 5l-7 7 7 7" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function ChevronRightIcon({ size = 16, color = colors.textFaint }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M9 6l6 6-6 6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function PlusIcon({ size = 16, color = colors.primary }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 5v14M5 12h14" stroke={color} strokeWidth={2.3} strokeLinecap="round" />
    </Svg>
  );
}

export function CheckIcon({ size = 12, color = colors.primary }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M5 13l4 4L19 7" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function HomeIcon({ size = 20, color = colors.textFaint }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1v-9Z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function UsersIcon({ size = 20, color = colors.textFaint }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="9" cy="8" r="3.2" stroke={color} strokeWidth={1.8} />
      <Circle cx="17" cy="9" r="2.4" stroke={color} strokeWidth={1.8} />
      <Path d="M3.5 19c.6-3 2.8-5 5.5-5s4.9 2 5.5 5" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M15.5 14.3c2.1.3 3.7 2 4.1 4.3" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

export function RecordsIcon({ size = 20, color = colors.textFaint }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M7 4h7l3 3v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
      <Path d="M9 10h6M9 13.5h6M9 17h3.5" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  );
}

export function ProfileIcon({ size = 20, color = colors.textFaint }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="8.5" r="3.3" stroke={color} strokeWidth={1.8} />
      <Path d="M5.5 19.5c.9-3.4 3.3-5.2 6.5-5.2s5.6 1.8 6.5 5.2" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

export function CameraIcon({ size = 20, color = "#fff" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 8a2 2 0 0 1 2-2h2l1.2-1.6A2 2 0 0 1 10.8 3.6h2.4a2 2 0 0 1 1.6.8L16 6h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8Z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      <Circle cx="12" cy="13" r="3.4" stroke={color} strokeWidth={1.8} />
    </Svg>
  );
}

export function BellIcon({ size = 19, color = colors.text }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M18 8a6 6 0 1 0-12 0c0 3-1 5-2 6h16c-1-1-2-3-2-6Z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
      <Path d="M9.5 18a2.5 2.5 0 0 0 5 0" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

export function CapsuleIcon({ size = 22, color = colors.primary }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="4" y="9" width="16" height="7" rx="3.5" stroke={color} strokeWidth={1.8} />
      <Line x1="12" y1="9" x2="12" y2="16" stroke={color} strokeWidth={1.8} />
    </Svg>
  );
}

export function TabletIcon({ size = 22, color = colors.amber }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="7" y="4" width="10" height="16" rx="5" stroke={color} strokeWidth={1.8} />
      <Line x1="7" y1="12" x2="17" y2="12" stroke={color} strokeWidth={1.8} />
    </Svg>
  );
}

export function SachetIcon({ size = 22, color = colors.indigo }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M8 4h8l2 4v11a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 19V8l2-4Z" stroke={color} strokeWidth={1.7} strokeLinejoin="round" />
    </Svg>
  );
}

export function DocIcon({ size = 20, color = colors.textFaint }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M6 3h9l3 3v15a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" stroke={color} strokeWidth={1.5} strokeLinejoin="round" />
      <Path d="M8 9h8M8 12.5h8M8 16h5" stroke={color} strokeWidth={1.3} strokeLinecap="round" />
    </Svg>
  );
}

export function HospitalIcon({ size = 16, color = colors.textFaint }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 21V9l8-6 8 6v12" stroke={color} strokeWidth={1.6} strokeLinejoin="round" />
      <Path d="M9 21v-7h6v7" stroke={color} strokeWidth={1.6} />
    </Svg>
  );
}

export function CalendarIcon({ size = 16, color = colors.textFaint }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3.5" y="4.5" width="17" height="16" rx="2.5" stroke={color} strokeWidth={1.6} />
      <Path d="M3.5 9h17M8 3v3M16 3v3" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  );
}

export function DoctorIcon({ size = 22, color = colors.primary }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 3a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V7a4 4 0 0 1 4-4Z" stroke={color} strokeWidth={1.7} />
      <Path d="M5 20c.8-3.6 3.5-5.6 7-5.6s6.2 2 7 5.6" stroke={color} strokeWidth={1.7} strokeLinecap="round" />
    </Svg>
  );
}

export function WarningIcon({ size = 15, color = colors.amber }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 4l9 15H3L12 4Z" stroke={color} strokeWidth={1.6} strokeLinejoin="round" />
      <Path d="M12 10v4M12 16.5v.1" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  );
}

export function DangerIcon({ size = 15, color = colors.red }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={1.7} />
      <Path d="M15 9l-6 6M9 9l6 6" stroke={color} strokeWidth={1.7} strokeLinecap="round" />
    </Svg>
  );
}

export function ShareIcon({ size = 15, color = colors.text }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="6" cy="12" r="2.4" stroke={color} strokeWidth={1.6} />
      <Circle cx="17" cy="6" r="2.4" stroke={color} strokeWidth={1.6} />
      <Circle cx="17" cy="18" r="2.4" stroke={color} strokeWidth={1.6} />
      <Path d="M8.1 10.8l6.8-3.7M8.1 13.2l6.8 3.7" stroke={color} strokeWidth={1.6} />
    </Svg>
  );
}

export function EditIcon({ size = 15, color = colors.text }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 20h4l10-10-4-4L4 16v4Z" stroke={color} strokeWidth={1.7} strokeLinejoin="round" />
    </Svg>
  );
}

export function TrashIcon({ size = 15, color = colors.red }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 7h14M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M7 7l1 13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-13"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function XIcon({ size = 16, color = colors.text }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M6 6l12 12M18 6L6 18" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

export function CheckCircleIcon({ size = 16, color = colors.primary }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M9 12.5l2 2 4.5-5" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={1.8} />
    </Svg>
  );
}

export function SparkleIcon({ size = 14, color = colors.primary }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z"
        fill={color}
        stroke={color}
        strokeWidth={0.5}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function DocumentIcon({ size = 16, color = "#fff" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M6 3h9l3 3v15a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" stroke={color} strokeWidth={1.6} strokeLinejoin="round" />
      <Path d="M8 9h8M8 12.5h8M8 16h5" stroke={color} strokeWidth={1.4} strokeLinecap="round" />
    </Svg>
  );
}

export function FlaskIcon({ size = 20, color = colors.indigo }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M9 3h6M10 3v6.5L5.5 18a2 2 0 0 0 1.8 2.9h9.4a2 2 0 0 0 1.8-2.9L14 9.5V3" stroke={color} strokeWidth={1.7} strokeLinejoin="round" />
      <Path d="M7.5 15h9" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}

export function GalleryIcon({ size = 16, color = "#fff" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="5" width="18" height="15" rx="2" stroke={color} strokeWidth={1.6} />
      <Circle cx="12" cy="12.5" r="3.4" stroke={color} strokeWidth={1.6} />
    </Svg>
  );
}

export function HeartIcon({ size = 22, color = colors.primary }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 20.3 4.6 13c-2.1-2.1-2.1-5.4 0-7.4 2-2 5.2-2 7.1.2l.3.3.3-.3c1.9-2.2 5.1-2.2 7.1-.2 2.1 2 2.1 5.3 0 7.4L12 20.3Z"
        stroke={color}
        strokeWidth={1.7}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function HeartPulseIcon({ size = 18, color = "#E4435A" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M2 12h4l1.5-3.5L11 17l2.5-10L15 12h7"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function LungsIcon({ size = 24, color = colors.primary }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 3v7.5" stroke={color} strokeWidth={1.7} strokeLinecap="round" />
      <Path
        d="M12 10.5c-1-2-2.8-2.6-4.2-1.8C6 9.7 5 11.5 5 14c0 2.8 1 5.3 2.4 6.4 1 .8 2.2.5 2.8-.6.7-1.2.8-3 .8-5.3v-3.5Z"
        stroke={color}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
      <Path
        d="M12 10.5c1-2 2.8-2.6 4.2-1.8C17.4 9.3 19 11.5 19 14c0 2.8-1 5.3-2.4 6.4-1 .8-2.2.5-2.8-.6-.7-1.2-.8-3-.8-5.3v-3.5Z"
        stroke={color}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
      <Path d="M8.5 7.5c0-1.4 1-2.5 1-3.5M15.5 7.5c0-1.4-1-2.5-1-3.5" stroke={color} strokeWidth={1.4} strokeLinecap="round" />
    </Svg>
  );
}

export function BrainIcon({ size = 24, color = colors.primary }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9.5 4.2c-1.8 0-3.2 1.4-3.2 3.1 0 .3 0 .6.1.9-1 .5-1.7 1.6-1.7 2.8 0 .9.4 1.7 1 2.2-.3.5-.5 1.1-.5 1.7 0 1.7 1.3 3.1 3 3.2v1.1c0 .9.7 1.6 1.6 1.6s1.6-.7 1.6-1.6V6.3c0-1.2-.9-2.1-1.9-2.1Z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      <Path
        d="M14.5 4.2c1.8 0 3.2 1.4 3.2 3.1 0 .3 0 .6-.1.9 1 .5 1.7 1.6 1.7 2.8 0 .9-.4 1.7-1 2.2.3.5.5 1.1.5 1.7 0 1.7-1.3 3.1-3 3.2v1.1c0 .9-.7 1.6-1.6 1.6s-1.6-.7-1.6-1.6V6.3c0-1.2.9-2.1 1.9-2.1Z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      <Path d="M12 7.5v11.5M9 10.2h2M13 10.2h2M8.8 13.6h2.4M12.8 13.6h2.4" stroke={color} strokeWidth={1.2} strokeLinecap="round" />
    </Svg>
  );
}
