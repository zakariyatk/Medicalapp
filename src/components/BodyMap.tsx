import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Animated, LayoutChangeEvent } from "react-native";
import Svg, { Path, Ellipse, Circle, Defs, LinearGradient, RadialGradient, Stop, G, Pattern, Rect } from "react-native-svg";
import type { BodyRegion } from "../lib/healthScreening";

/**
 * Front-view anatomy figure drawn on a 200×400 grid, shaded to read like a 3D render:
 * each body part has its own cylinder-style gradient (lit from the upper left), muscles are
 * modelled with soft shading and highlights, and affected areas are drawn as red muscle.
 * The right side of the body is the left side mirrored.
 */

/** Mirrors an absolute-coordinate path (M/L/C/Q/Z) across the body's centre line x = 100. */
function mirror(d: string): string {
  let isX = true;
  return d.replace(/([MLCQZ])|(-?\d*\.?\d+)/g, (token, cmd) => {
    if (cmd) {
      isX = true;
      return cmd;
    }
    const out = isX ? String(200 - Number(token)) : token;
    isX = !isX;
    return out;
  });
}
const both = (d: string) => [d, mirror(d)];

// ---- Body geometry (left side; the right is mirrored) ---------------------------------------

const HEAD =
  "M100 14 C112 14 120 24 120 38 C120 50 116 58 110 63 C106 66 103 67 100 67 C97 67 94 66 90 63 C84 58 80 50 80 38 C80 24 88 14 100 14 Z";
const NECK = "M91 56 C92 66 90 74 85 83 L115 83 C110 74 108 66 109 56 Z";
const TORSO =
  "M86 80 C76 82 64 84 56 90 C48 95 46 104 47 114 C48 128 52 140 56 150 C58 162 60 176 62 190 C63 202 62 214 60 228 L140 228 C138 214 137 202 138 190 C140 176 142 162 144 150 C148 140 152 128 153 114 C154 104 152 95 144 90 C136 84 124 82 114 80 Z";
const PELVIS = "M60 220 C64 236 78 246 100 250 C122 246 136 236 140 220 Z";
const UPPER_ARM = "M57 91 C46 93 40 104 39 118 C38 132 38 146 37 160 C40 165 48 165 50 158 C52 146 54 132 57 116 Z";
const FOREARM = "M37 155 C35 172 32 190 29 208 C32 213 38 213 41 208 C44 192 48 176 50 157 Z";
const HAND = "M29 206 C25 214 22 224 23 232 C24 239 29 241 32 238 C33 233 35 229 37 225 C39 222 41 214 41 208 Z";
const THIGH = "M60 224 C58 250 60 272 66 297 C71 302 85 302 93 297 C96 272 99 252 100 238 Z";
const SHIN = "M66 294 C66 320 68 346 72 372 C76 377 84 377 88 372 C90 346 92 320 93 296 Z";
const FOOT = "M72 370 C70 380 65 388 66 393 C70 397 85 397 90 393 C90 385 89 378 88 372 Z";

// Muscle shapes used for shading and for highlighting affected areas.
const PEC = "M100 99 C90 96 74 97 64 105 C59 113 61 124 70 130 C80 135 92 133 100 128 Z";
const DELTOID = "M57 89 C46 92 40 102 41 116 C43 122 47 124 51 120 C53 110 58 102 64 97 C64 93 61 90 57 89 Z";
const TRAP = "M92 76 C86 80 76 84 66 88 C70 91 78 92 86 90 C90 87 92 82 92 76 Z";
const BICEP = "M43 118 C41 130 41 142 42 152 C45 156 49 154 50 148 C51 138 52 126 52 118 C49 114 45 114 43 118 Z";
const QUAD = "M66 236 C63 256 66 276 72 292 C78 294 86 294 90 290 C93 272 94 254 92 238 C84 232 72 232 66 236 Z";
const KNEE = "M70 290 C70 298 74 306 80 307 C86 306 90 298 90 290 C86 286 74 286 70 290 Z";

const SKIN = { light: "#F6F4F9", mid: "#DAD6E2", dark: "#ADA7BB", edge: "#C9C3D3" };
const MUSCLE = { light: "#EFA48C", mid: "#D46F57", dark: "#A23F31", fiber: "#F7C6B4" };

/** Where each region sits, and how far to zoom in on it. */
const REGIONS: Record<BodyRegion, { x: number; y: number; view: [number, number, number, number] }> = {
  head: { x: 100, y: 34, view: [20, 0, 160, 230] },
  throat: { x: 100, y: 72, view: [20, 0, 160, 230] },
  thyroid: { x: 100, y: 78, view: [20, 0, 160, 230] },
  lungs: { x: 84, y: 120, view: [10, 20, 180, 260] },
  heart: { x: 108, y: 126, view: [10, 20, 180, 260] },
  stomach: { x: 104, y: 166, view: [10, 40, 180, 260] },
  shoulders: { x: 50, y: 104, view: [10, 10, 180, 240] },
  knees: { x: 80, y: 298, view: [10, 160, 180, 240] },
  skin: { x: 46, y: 140, view: [0, 0, 200, 400] },
  wholeBody: { x: 100, y: 130, view: [0, 0, 200, 400] },
};

/** Thin curved lines that give a highlighted muscle its fibre texture. */
function Fibers({ d }: { d: string }) {
  return <Path d={d} stroke={MUSCLE.fiber} strokeWidth={0.5} fill="none" opacity={0.65} strokeLinecap="round" />;
}

function Muscle({ d, fibers }: { d: string; fibers?: string }) {
  return (
    <G>
      <Path d={d} fill="url(#muscle)" stroke={MUSCLE.dark} strokeWidth={0.4} />
      {fibers ? <Fibers d={fibers} /> : null}
    </G>
  );
}

function RegionShape({ region }: { region: BodyRegion }) {
  switch (region) {
    case "head":
      return (
        <G>
          <Ellipse cx={100} cy={32} rx={17} ry={14} fill="url(#ache)" />
          <Ellipse cx={84} cy={38} rx={5} ry={6} fill="url(#ache)" />
          <Ellipse cx={116} cy={38} rx={5} ry={6} fill="url(#ache)" />
        </G>
      );
    case "throat":
      return (
        <G>
          <Path d="M93 62 C93 68 94 74 96 80 L104 80 C106 74 107 68 107 62 C104 64 96 64 93 62 Z" fill="url(#muscle)" opacity={0.9} />
          <Ellipse cx={100} cy={70} rx={11} ry={10} fill="url(#ache)" />
        </G>
      );
    case "thyroid":
      return (
        <G>
          <Path d="M100 76 C96 72 90 73 90 78 C90 83 96 84 100 80 C104 84 110 83 110 78 C110 73 104 72 100 76 Z" fill="url(#muscle)" />
          <Ellipse cx={100} cy={78} rx={13} ry={8} fill="url(#ache)" />
        </G>
      );
    case "lungs":
      return (
        <G opacity={0.85}>
          <Path d="M96 102 C86 98 74 104 70 118 C66 134 68 150 74 158 C84 162 94 156 96 146 Z" fill="url(#muscle)" />
          <Path d={mirror("M96 102 C86 98 74 104 70 118 C66 134 68 150 74 158 C84 162 94 156 96 146 Z")} fill="url(#muscle)" />
          <Fibers d="M90 110 C82 118 78 132 80 148 M84 108 C76 118 74 134 76 152" />
          <Fibers d={mirror("M90 110 C82 118 78 132 80 148 M84 108 C76 118 74 134 76 152")} />
        </G>
      );
    case "heart":
      return (
        <G>
          <Ellipse cx={108} cy={128} rx={16} ry={16} fill="url(#ache)" />
          <Path
            d="M108 140 C96 133 96 122 101 118 C104 115 107 117 108 120 C110 115 116 114 118 119 C121 127 115 136 108 140 Z"
            fill="url(#muscle)"
            stroke={MUSCLE.dark}
            strokeWidth={0.5}
          />
          <Fibers d="M103 121 C104 128 106 133 108 137 M113 119 C114 126 112 132 109 136" />
        </G>
      );
    case "stomach":
      return (
        <G>
          <Path d="M92 156 C102 150 118 154 120 164 C123 178 108 184 98 180 C90 176 86 166 92 156 Z" fill="url(#muscle)" />
          <Fibers d="M94 160 C104 158 114 162 116 170 M93 168 C102 170 110 174 114 176" />
          <Ellipse cx={105} cy={168} rx={20} ry={16} fill="url(#ache)" />
        </G>
      );
    case "shoulders":
      return (
        <G>
          <Muscle d={TRAP} fibers="M90 79 C84 83 76 86 70 88 M88 84 C82 87 76 89 72 90" />
          <Muscle d={mirror(TRAP)} fibers={mirror("M90 79 C84 83 76 86 70 88")} />
          <Muscle d={DELTOID} fibers="M58 92 C50 98 45 106 44 114 M61 95 C54 101 49 108 48 117 M55 91 C48 95 43 103 42 112" />
          <Muscle d={BICEP} fibers="M46 120 C45 132 45 142 46 150 M49 120 C49 132 48 142 48 150" />
          <Muscle d={mirror(DELTOID)} fibers={mirror("M58 92 C50 98 45 106 44 114 M61 95 C54 101 49 108 48 117")} />
        </G>
      );
    case "knees":
      return (
        <G>
          <Muscle d={KNEE} fibers="M74 292 C78 298 82 300 86 292" />
          <Muscle d={mirror(KNEE)} />
          <Ellipse cx={80} cy={298} rx={15} ry={14} fill="url(#ache)" />
        </G>
      );
    case "skin":
      return (
        <G fill="url(#ache)" opacity={0.8}>
          <Ellipse cx={46} cy={140} rx={10} ry={30} />
          <Ellipse cx={80} cy={170} rx={14} ry={24} />
          <Ellipse cx={154} cy={140} rx={10} ry={30} />
        </G>
      );
    case "wholeBody":
      return (
        <G>
          <G fill={MUSCLE.mid} opacity={0.12}>
            <Path d={TORSO} />
            {both(UPPER_ARM).map((d) => <Path key={d} d={d} />)}
            {both(FOREARM).map((d) => <Path key={d} d={d} />)}
            {both(THIGH).map((d) => <Path key={d} d={d} />)}
            {both(SHIN).map((d) => <Path key={d} d={d} />)}
          </G>
          <Ellipse cx={100} cy={36} rx={22} ry={22} fill="url(#ache)" />
        </G>
      );
  }
}

/** The shaded base figure. */
function Figure() {
  const limb = (d: string, key: string) => <Path key={key} d={d} fill="url(#limb)" stroke={SKIN.edge} strokeWidth={0.4} />;
  return (
    <G>
      {/* soft floor shadow */}
      <Ellipse cx={100} cy={396} rx={46} ry={5} fill="#000" opacity={0.06} />

      {/* back layer: legs, arms */}
      {both(FOOT).map((d, i) => limb(d, `foot${i}`))}
      {both(SHIN).map((d, i) => limb(d, `shin${i}`))}
      {both(THIGH).map((d, i) => limb(d, `thigh${i}`))}
      {both(HAND).map((d, i) => limb(d, `hand${i}`))}
      {both(FOREARM).map((d, i) => limb(d, `fore${i}`))}
      {both(UPPER_ARM).map((d, i) => limb(d, `upper${i}`))}

      {/* torso, pelvis, neck, head */}
      <Path d={NECK} fill="url(#limb)" />
      <Path d={TORSO} fill="url(#torso)" stroke={SKIN.edge} strokeWidth={0.4} />
      <Path d={PELVIS} fill="url(#pelvis)" />
      <Path d={HEAD} fill="url(#head)" stroke={SKIN.edge} strokeWidth={0.4} />
      <Ellipse cx={80.5} cy={42} rx={2.6} ry={6} fill="url(#limb)" />
      <Ellipse cx={119.5} cy={42} rx={2.6} ry={6} fill="url(#limb)" />

      {/* muscle modelling: soft shading + top-lit highlights */}
      <G>
        {both(PEC).map((d, i) => (
          <Path key={`pec${i}`} d={d} fill="url(#pec)" />
        ))}
        {both(DELTOID).map((d, i) => (
          <Path key={`delt${i}`} d={d} fill="url(#bulge)" />
        ))}
        {both(BICEP).map((d, i) => (
          <Path key={`bi${i}`} d={d} fill="url(#bulge)" opacity={0.8} />
        ))}
        {both(QUAD).map((d, i) => (
          <Path key={`quad${i}`} d={d} fill="url(#bulge)" opacity={0.75} />
        ))}
        {both(KNEE).map((d, i) => (
          <Path key={`knee${i}`} d={d} fill="url(#bulge)" opacity={0.6} />
        ))}
        {/* abs: three rows of paired blocks */}
        {[138, 154, 170].map((y) =>
          [88, 101].map((x) => (
            <Path
              key={`ab${x}${y}`}
              d={`M${x} ${y + 2} C${x} ${y} ${x + 11} ${y} ${x + 11} ${y + 2} L${x + 11} ${y + 12} C${x + 11} ${y + 14} ${x} ${y + 14} ${x} ${y + 12} Z`}
              fill="url(#bulge)"
              opacity={0.75}
            />
          )),
        )}
      </G>

      {/* creases and shadow lines (ambient occlusion) */}
      <G stroke={SKIN.dark} fill="none" strokeLinecap="round">
        <Path d="M100 104 L100 214" strokeWidth={0.7} opacity={0.5} />
        {both("M66 129 C78 137 92 135 100 130").map((d) => <Path key={d} d={d} strokeWidth={1.4} opacity={0.35} />)}
        {both("M72 87 C82 91 92 89 99 92").map((d) => <Path key={d} d={d} strokeWidth={0.8} opacity={0.45} />)}
        {both("M93 60 C95 70 97 78 99 85").map((d) => <Path key={d} d={d} strokeWidth={0.7} opacity={0.4} />)}
        {both("M64 150 C70 168 74 186 80 200").map((d) => <Path key={d} d={d} strokeWidth={0.8} opacity={0.35} />)}
        {both("M52 104 C50 112 51 120 52 124").map((d) => <Path key={d} d={d} strokeWidth={1.2} opacity={0.3} />)}
        {both("M64 222 C76 236 88 242 100 246").map((d) => <Path key={d} d={d} strokeWidth={0.9} opacity={0.35} />)}
      </G>

      {/* face: gentle sockets, nose, mouth */}
      <G>
        <Ellipse cx={92} cy={38} rx={5} ry={3} fill={SKIN.dark} opacity={0.22} />
        <Ellipse cx={108} cy={38} rx={5} ry={3} fill={SKIN.dark} opacity={0.22} />
        <Path d="M100 38 C99 45 97 49 98 51 C99 52.5 101 52.5 102 51" stroke={SKIN.dark} strokeWidth={0.8} fill="none" opacity={0.6} />
        <Path d="M95 57 C98 58.4 102 58.4 105 57" stroke={SKIN.dark} strokeWidth={0.9} fill="none" opacity={0.6} strokeLinecap="round" />
        <Path d="M87 33 C90 31 94 31 96 32 M104 32 C106 31 110 31 113 33" stroke={SKIN.dark} strokeWidth={0.9} fill="none" opacity={0.4} strokeLinecap="round" />
      </G>

      {/* specular highlights */}
      <G fill="#FFFFFF">
        <Ellipse cx={94} cy={24} rx={7} ry={4} opacity={0.55} />
        <Ellipse cx={50} cy={98} rx={4} ry={6} opacity={0.5} />
        <Ellipse cx={146} cy={98} rx={3} ry={5} opacity={0.3} />
        <Ellipse cx={80} cy={108} rx={9} ry={4} opacity={0.45} />
        <Ellipse cx={118} cy={108} rx={7} ry={3} opacity={0.3} />
        <Ellipse cx={74} cy={254} rx={4} ry={12} opacity={0.35} />
        <Ellipse cx={76} cy={330} rx={2.5} ry={12} opacity={0.3} />
      </G>
    </G>
  );
}

export default function BodyMap({
  regions,
  focus,
  label,
  height = 340,
}: {
  /** Regions to highlight. */
  regions: BodyRegion[];
  /** Region to zoom to and mark with a dot and label. */
  focus: BodyRegion;
  label: string;
  height?: number;
}) {
  const [width, setWidth] = useState(0);
  const [pulse] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const loop = Animated.loop(Animated.timing(pulse, { toValue: 1, duration: 1600, useNativeDriver: true }));
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const spot = REGIONS[focus];
  const [vx, vy, vw, vh] = spot.view;
  // Same maths as preserveAspectRatio="xMidYMid meet", so the dot lands on the drawing.
  const scale = width ? Math.min(width / vw, height / vh) : 0;
  const dotX = (width - vw * scale) / 2 + (spot.x - vx) * scale;
  const dotY = (height - vh * scale) / 2 + (spot.y - vy) * scale;
  const labelOnLeft = dotX > width / 2;

  return (
    <View style={{ height }} onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}>
      {width > 0 ? (
        <>
          <Svg width={width} height={height} viewBox={`${vx} ${vy} ${vw} ${vh}`} preserveAspectRatio="xMidYMid meet">
            <Defs>
              {/* Cylinder-style shading: light from the upper left, falling off to the right edge. */}
              <LinearGradient id="limb" x1="0" y1="0" x2="1" y2="0.25">
                <Stop offset="0" stopColor={SKIN.mid} />
                <Stop offset="0.3" stopColor={SKIN.light} />
                <Stop offset="0.7" stopColor={SKIN.mid} />
                <Stop offset="1" stopColor={SKIN.dark} />
              </LinearGradient>
              <LinearGradient id="torso" x1="0" y1="0" x2="1" y2="0.3">
                <Stop offset="0" stopColor={SKIN.mid} />
                <Stop offset="0.28" stopColor={SKIN.light} />
                <Stop offset="0.62" stopColor="#E6E3EC" />
                <Stop offset="1" stopColor={SKIN.dark} />
              </LinearGradient>
              <RadialGradient id="head" cx="40%" cy="35%" r="70%">
                <Stop offset="0" stopColor={SKIN.light} />
                <Stop offset="0.6" stopColor={SKIN.mid} />
                <Stop offset="1" stopColor={SKIN.dark} />
              </RadialGradient>
              <LinearGradient id="pelvis" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={SKIN.dark} stopOpacity={0} />
                <Stop offset="1" stopColor={SKIN.dark} stopOpacity={0.35} />
              </LinearGradient>
              <LinearGradient id="pec" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0.35} />
                <Stop offset="0.7" stopColor={SKIN.mid} stopOpacity={0.1} />
                <Stop offset="1" stopColor={SKIN.dark} stopOpacity={0.45} />
              </LinearGradient>
              <RadialGradient id="bulge" cx="40%" cy="35%" r="65%">
                <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0.45} />
                <Stop offset="0.65" stopColor={SKIN.mid} stopOpacity={0.05} />
                <Stop offset="1" stopColor={SKIN.dark} stopOpacity={0.4} />
              </RadialGradient>
              <LinearGradient id="muscle" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor={MUSCLE.light} />
                <Stop offset="0.45" stopColor={MUSCLE.mid} />
                <Stop offset="1" stopColor={MUSCLE.dark} />
              </LinearGradient>
              <RadialGradient id="ache" cx="50%" cy="50%" r="50%">
                <Stop offset="0" stopColor="#F0582A" stopOpacity={0.75} />
                <Stop offset="0.6" stopColor="#F28A5E" stopOpacity={0.35} />
                <Stop offset="1" stopColor="#F4A27A" stopOpacity={0} />
              </RadialGradient>
              <RadialGradient id="glow" cx="50%" cy="50%" r="50%">
                <Stop offset="0" stopColor="#FAD3B4" stopOpacity={0.9} />
                <Stop offset="1" stopColor="#FAD3B4" stopOpacity={0} />
              </RadialGradient>
              <Pattern id="dots" width={8} height={8} patternUnits="userSpaceOnUse">
                <Circle cx={1} cy={1} r={0.6} fill="#D9D2CA" />
              </Pattern>
            </Defs>

            <Rect x={-200} y={-200} width={600} height={800} fill="url(#dots)" />
            <Circle cx={spot.x} cy={spot.y} r={vw * 0.45} fill="url(#glow)" />

            <Figure />
            {regions.map((r) => (
              <RegionShape key={r} region={r} />
            ))}
          </Svg>

          {/* pulsing marker on the focused area */}
          <Animated.View
            pointerEvents="none"
            style={[
              styles.ring,
              {
                left: dotX - 18,
                top: dotY - 18,
                opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.7, 0] }),
                transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1.4] }) }],
              },
            ]}
          />
          <View pointerEvents="none" style={[styles.dot, { left: dotX - 7, top: dotY - 7 }]} />

          <View
            pointerEvents="none"
            style={[
              styles.label,
              labelOnLeft
                ? { right: Math.max(8, width - dotX + 22), top: dotY - 46 }
                : { left: Math.min(dotX + 22, width - 168), top: dotY - 46 },
            ]}
          >
            <Text style={styles.labelText} numberOfLines={2}>
              {label}
            </Text>
          </View>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  ring: { position: "absolute", width: 36, height: 36, borderRadius: 18, backgroundColor: "#F59E5B" },
  dot: {
    position: "absolute",
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#F59E5B",
    borderWidth: 2.5,
    borderColor: "#FFFFFF",
  },
  label: {
    position: "absolute",
    maxWidth: 160,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 18,
    backgroundColor: "rgba(250, 226, 204, 0.95)",
  },
  labelText: { fontSize: 14, fontWeight: "600", color: "#2A1E16" },
});
