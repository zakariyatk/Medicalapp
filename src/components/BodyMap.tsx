import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Animated, LayoutChangeEvent } from "react-native";
import Svg, { Path, Ellipse, Circle, Defs, LinearGradient, RadialGradient, Stop, G, Pattern, Rect } from "react-native-svg";
import type { BodyRegion } from "../lib/healthScreening";

/** Front-view body drawn on a 200×400 grid. Regions are highlighted with a warm glow. */

const SKIN_TOP = "#EEECF2";
const SKIN_BOTTOM = "#C9C5D3";
const OUTLINE = "#B4AFC0";
const HOT = "#E8734A";

const HEAD = { cx: 100, cy: 42, rx: 21, ry: 26 };
const NECK = "M90 60 L110 60 Q111 74 116 84 L84 84 Q89 74 90 60 Z";
const TORSO =
  "M88 80 Q70 82 56 90 Q46 96 46 112 L50 150 Q54 178 62 200 Q64 214 62 232 L138 232 Q136 214 138 200 Q146 178 150 150 L154 112 Q154 96 144 90 Q130 82 112 80 Z";
const ARM_L = "M50 94 Q38 98 35 118 L29 178 Q27 204 24 224 Q22 240 29 246 Q37 249 39 237 L45 188 L52 152 L56 112 Z";
const ARM_R = "M150 94 Q162 98 165 118 L171 178 Q173 204 176 224 Q178 240 171 246 Q163 249 161 237 L155 188 L148 152 L144 112 Z";
const LEG_L = "M63 226 L99 228 L97 300 Q96 340 93 378 Q93 393 81 393 Q70 391 72 378 L70 300 Q64 262 63 226 Z";
const LEG_R = "M137 226 L101 228 L103 300 Q104 340 107 378 Q107 393 119 393 Q130 391 128 378 L130 300 Q136 262 137 226 Z";
// Light muscle lines for a bit of form.
const DETAIL =
  "M100 96 L100 214 M72 104 Q86 112 98 108 M128 104 Q114 112 102 108 M80 150 Q90 154 98 150 M120 150 Q110 154 102 150 M82 178 Q90 180 98 178 M118 178 Q110 180 102 178";

/** Where each region sits, and how far to zoom in on it. */
const REGIONS: Record<BodyRegion, { x: number; y: number; view: [number, number, number, number] }> = {
  head: { x: 100, y: 40, view: [20, 0, 160, 230] },
  throat: { x: 100, y: 76, view: [20, 0, 160, 230] },
  thyroid: { x: 100, y: 80, view: [20, 0, 160, 230] },
  lungs: { x: 86, y: 126, view: [10, 20, 180, 260] },
  heart: { x: 108, y: 132, view: [10, 20, 180, 260] },
  stomach: { x: 104, y: 172, view: [10, 40, 180, 260] },
  shoulders: { x: 58, y: 96, view: [10, 10, 180, 240] },
  knees: { x: 82, y: 304, view: [10, 160, 180, 240] },
  skin: { x: 48, y: 160, view: [0, 0, 200, 400] },
  wholeBody: { x: 100, y: 140, view: [0, 0, 200, 400] },
};

function RegionShape({ region }: { region: BodyRegion }) {
  const fill = "url(#hot)";
  switch (region) {
    case "head":
      return <Ellipse {...HEAD} fill={fill} opacity={0.85} />;
    case "throat":
      return (
        <G>
          <Ellipse cx={100} cy={75} rx={10} ry={9} fill={fill} />
          <Circle cx={95} cy={74} r={3} fill={HOT} opacity={0.9} />
          <Circle cx={105} cy={74} r={3} fill={HOT} opacity={0.9} />
        </G>
      );
    case "thyroid":
      return (
        <G>
          <Ellipse cx={94} cy={80} rx={6} ry={4.5} fill={fill} />
          <Ellipse cx={106} cy={80} rx={6} ry={4.5} fill={fill} />
        </G>
      );
    case "lungs":
      return (
        <G>
          <Path d="M96 104 Q78 102 72 122 Q68 142 72 156 Q84 162 96 152 Z" fill={fill} />
          <Path d="M104 104 Q122 102 128 122 Q132 142 128 156 Q116 162 104 152 Z" fill={fill} />
        </G>
      );
    case "heart":
      return (
        <Path
          d="M108 142 Q96 134 98 124 Q100 117 107 121 Q113 115 118 121 Q121 131 108 142 Z"
          fill={HOT}
          opacity={0.9}
        />
      );
    case "stomach":
      return <Path d="M92 160 Q112 154 120 166 Q124 182 106 186 Q94 188 90 178 Q86 168 92 160 Z" fill={fill} />;
    case "shoulders":
      return (
        <G>
          <Circle cx={58} cy={97} r={14} fill={fill} />
          <Circle cx={142} cy={97} r={14} fill={fill} opacity={0.75} />
          <Path d="M88 84 Q74 86 62 92 L74 100 Q86 94 92 92 Z" fill={fill} opacity={0.8} />
          <Path d="M112 84 Q126 86 138 92 L126 100 Q114 94 108 92 Z" fill={fill} opacity={0.6} />
        </G>
      );
    case "knees":
      return (
        <G>
          <Circle cx={83} cy={304} r={11} fill={fill} />
          <Circle cx={117} cy={304} r={11} fill={fill} opacity={0.8} />
        </G>
      );
    case "skin":
      return (
        <G fill="none" stroke={HOT} strokeWidth={2.5} opacity={0.75}>
          <Path d={TORSO} />
          <Path d={ARM_L} />
          <Path d={ARM_R} />
        </G>
      );
    case "wholeBody":
      return (
        <G>
          <G fill={HOT} opacity={0.14}>
            <Path d={TORSO} />
            <Path d={ARM_L} />
            <Path d={ARM_R} />
            <Path d={LEG_L} />
            <Path d={LEG_R} />
            <Path d={NECK} />
          </G>
          <Ellipse {...HEAD} fill={fill} opacity={0.7} />
        </G>
      );
  }
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
    const loop = Animated.loop(
      Animated.timing(pulse, { toValue: 1, duration: 1600, useNativeDriver: true }),
    );
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
              <LinearGradient id="skin" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor={SKIN_TOP} />
                <Stop offset="1" stopColor={SKIN_BOTTOM} />
              </LinearGradient>
              <RadialGradient id="hot" cx="50%" cy="50%" r="50%">
                <Stop offset="0" stopColor="#F05A2A" stopOpacity={0.95} />
                <Stop offset="0.7" stopColor={HOT} stopOpacity={0.7} />
                <Stop offset="1" stopColor="#F4A27A" stopOpacity={0.35} />
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

            <G fill="url(#skin)" stroke={OUTLINE} strokeWidth={0.6}>
              <Path d={LEG_L} />
              <Path d={LEG_R} />
              <Path d={ARM_L} />
              <Path d={ARM_R} />
              <Path d={NECK} />
              <Path d={TORSO} />
              <Ellipse {...HEAD} />
            </G>
            <Path d={DETAIL} stroke={OUTLINE} strokeWidth={0.6} fill="none" opacity={0.7} strokeLinecap="round" />

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
