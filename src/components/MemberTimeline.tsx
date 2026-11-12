import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated } from "react-native";
import Svg, { Line, Polygon } from "react-native-svg";
import { colors } from "../theme";

export type TimelineMedicine = { id: string; label: string };

export type TimelineVisit = {
  id: string;
  dateLabel: string;
  doctorName: string;
  subLine: string;
  medicines: TimelineMedicine[];
  onPress: () => void;
  onPressMedicine: (medicineId: string) => void;
};

type Props = {
  visits: TimelineVisit[];
};

const RAIL_X = 28;
const CARD_LEFT = 60;
const CARD_HEIGHT = 72;
const CHIP_HEIGHT = 44;
const CHIP_GAP = 13;
const GAP_AFTER_VISIT = 48;
const NODE_SIZE_FIRST = 20;
const NODE_SIZE_REST = 14;
const TOP_MARGIN = 36;
const BOTTOM_MARGIN = 24;

const RAIL_COLOR = "#1F3F3B";
const STUB_COLOR = colors.borderStrong;
const CONNECTOR_COLOR = colors.primary;
const BRANCH_COLOR = colors.textFaint;

type ChipSlot = { id: string; label: string; isMore?: boolean; left: number; width: number };

type VisitBlock = {
  visit: TimelineVisit;
  nodeY: number;
  nodeSize: number;
  cardTop: number;
  chips: ChipSlot[];
  chipTop: number;
  useFan: boolean;
  fanY: number;
  centerX: number;
  cardWidth: number;
};

function buildLayout(visits: TimelineVisit[], hostWidth: number) {
  const cardWidth = Math.max(hostWidth - CARD_LEFT, 120);
  const centerX = CARD_LEFT + cardWidth / 2;
  let cursorY = TOP_MARGIN;
  const blocks: VisitBlock[] = [];

  visits.forEach((visit, i) => {
    const nodeSize = i === 0 ? NODE_SIZE_FIRST : NODE_SIZE_REST;
    const cardTop = cursorY - CARD_HEIGHT / 2;
    const cardBottom = cardTop + CARD_HEIGHT;

    const meds: ChipSlot[] =
      visit.medicines.length <= 3
        ? visit.medicines.map((m) => ({ ...m, left: 0, width: 0 }))
        : [
            ...visit.medicines.slice(0, 2).map((m) => ({ ...m, left: 0, width: 0 })),
            { id: `${visit.id}-more`, label: `+${visit.medicines.length - 2} more`, isMore: true, left: 0, width: 0 },
          ];
    const k = meds.length;
    const useFan = k > 1;
    const fanY = cardBottom + 16;
    const chipTop = useFan ? fanY + 24 : cardBottom + 40;

    if (k === 1) {
      const w = Math.min(170, cardWidth * 0.6);
      meds[0] = { ...meds[0], left: centerX - w / 2, width: w };
    } else {
      const w = (cardWidth - CHIP_GAP * (k - 1)) / k;
      meds.forEach((m, idx) => {
        meds[idx] = { ...m, left: CARD_LEFT + idx * (w + CHIP_GAP), width: w };
      });
    }

    const chipBottom = chipTop + CHIP_HEIGHT;

    blocks.push({ visit, nodeY: cursorY, nodeSize, cardTop, chips: meds, chipTop, useFan, fanY, centerX, cardWidth });
    cursorY = chipBottom + GAP_AFTER_VISIT;
  });

  const totalHeight = blocks.length
    ? blocks[blocks.length - 1].chipTop + CHIP_HEIGHT + BOTTOM_MARGIN
    : 0;
  const railTop = blocks[0]?.nodeY ?? 0;
  const railBottom = blocks[blocks.length - 1]?.nodeY ?? 0;

  return { blocks, totalHeight, railTop, railBottom, cardWidth };
}

export default function MemberTimeline({ visits }: Props) {
  const [hostWidth, setHostWidth] = useState(0);
  const layout = useMemo(() => (hostWidth > 0 ? buildLayout(visits, hostWidth) : null), [visits, hostWidth]);

  const [svgOpacity] = useState(() => new Animated.Value(0));
  const [blockAnims] = useState(() => visits.map(() => new Animated.Value(0)));
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!layout || hasAnimated.current) return;
    hasAnimated.current = true;
    Animated.timing(svgOpacity, { toValue: 1, duration: 420, useNativeDriver: true }).start();
    Animated.stagger(
      140,
      blockAnims.map((v) => Animated.timing(v, { toValue: 1, duration: 380, useNativeDriver: true }))
    ).start();
  }, [layout, svgOpacity, blockAnims]);

  return (
    <View onLayout={(e) => setHostWidth(e.nativeEvent.layout.width)}>
      {layout ? (
        <View style={{ width: hostWidth, height: layout.totalHeight }}>
          <Animated.View style={[StyleSheet.absoluteFill, { opacity: svgOpacity }]} pointerEvents="none">
            <Svg width={hostWidth} height={layout.totalHeight}>
              {layout.blocks.length > 1 ? (
                <Line
                  x1={RAIL_X}
                  y1={layout.railTop}
                  x2={RAIL_X}
                  y2={layout.railBottom}
                  stroke={RAIL_COLOR}
                  strokeWidth={2}
                  strokeLinecap="round"
                />
              ) : null}

              {layout.blocks.map((b) => (
                <React.Fragment key={`arrows-${b.visit.id}`}>
                  {/* node → card connector */}
                  <Line
                    x1={RAIL_X + b.nodeSize / 2}
                    y1={b.nodeY}
                    x2={CARD_LEFT - 6}
                    y2={b.nodeY}
                    stroke={CONNECTOR_COLOR}
                    strokeWidth={2}
                    strokeLinecap="round"
                  />
                  <Polygon
                    points={`${CARD_LEFT - 6},${b.nodeY - 4} ${CARD_LEFT},${b.nodeY} ${CARD_LEFT - 6},${b.nodeY + 4}`}
                    fill={CONNECTOR_COLOR}
                  />

                  {/* card → medicines branch */}
                  {b.useFan ? (
                    <React.Fragment>
                      <Line
                        x1={b.centerX}
                        y1={b.cardTop + CARD_HEIGHT}
                        x2={b.centerX}
                        y2={b.fanY}
                        stroke={STUB_COLOR}
                        strokeWidth={2}
                        strokeLinecap="round"
                      />
                      <Line
                        x1={b.chips[0].left + b.chips[0].width / 2}
                        y1={b.fanY}
                        x2={b.chips[b.chips.length - 1].left + b.chips[b.chips.length - 1].width / 2}
                        y2={b.fanY}
                        stroke={STUB_COLOR}
                        strokeWidth={2}
                        strokeLinecap="round"
                      />
                      {b.chips.map((c) => {
                        const cx = c.left + c.width / 2;
                        return (
                          <React.Fragment key={`fan-${c.id}`}>
                            <Line x1={cx} y1={b.fanY} x2={cx} y2={b.chipTop - 6} stroke={BRANCH_COLOR} strokeWidth={2} strokeLinecap="round" />
                            <Polygon points={`${cx - 4},${b.chipTop - 6} ${cx},${b.chipTop} ${cx + 4},${b.chipTop - 6}`} fill={BRANCH_COLOR} />
                          </React.Fragment>
                        );
                      })}
                    </React.Fragment>
                  ) : (
                    <React.Fragment>
                      <Line
                        x1={b.centerX}
                        y1={b.cardTop + CARD_HEIGHT}
                        x2={b.centerX}
                        y2={b.chipTop - 6}
                        stroke={BRANCH_COLOR}
                        strokeWidth={2}
                        strokeLinecap="round"
                      />
                      <Polygon
                        points={`${b.centerX - 4},${b.chipTop - 6} ${b.centerX},${b.chipTop} ${b.centerX + 4},${b.chipTop - 6}`}
                        fill={BRANCH_COLOR}
                      />
                    </React.Fragment>
                  )}
                </React.Fragment>
              ))}
            </Svg>
          </Animated.View>

          {layout.blocks.map((b, idx) => {
            const anim = blockAnims[idx] ?? svgOpacity;
            return (
              <Animated.View
                key={`block-${b.visit.id}`}
                pointerEvents="box-none"
                style={[
                  StyleSheet.absoluteFill,
                  {
                    opacity: anim,
                    transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
                  },
                ]}
              >
                <View
                  style={[
                    styles.node,
                    {
                      left: RAIL_X - b.nodeSize / 2,
                      top: b.nodeY - b.nodeSize / 2,
                      width: b.nodeSize,
                      height: b.nodeSize,
                      borderRadius: b.nodeSize / 2,
                    },
                    b.nodeSize === NODE_SIZE_FIRST ? styles.nodeLatest : null,
                  ]}
                />

                <TouchableOpacity
                  onPress={b.visit.onPress}
                  style={[styles.card, { left: CARD_LEFT, top: b.cardTop, width: b.cardWidth, height: CARD_HEIGHT }]}
                >
                  <Text style={styles.cardDate}>{b.visit.dateLabel}</Text>
                  <Text style={styles.cardDoctor}>{b.visit.doctorName}</Text>
                  <Text style={styles.cardSub}>{b.visit.subLine}</Text>
                </TouchableOpacity>

                {b.chips.map((c) => (
                  <TouchableOpacity
                    key={`chip-${c.id}`}
                    onPress={() => (c.isMore ? b.visit.onPress() : b.visit.onPressMedicine(c.id))}
                    style={[styles.chip, { left: c.left, top: b.chipTop, width: c.width, height: CHIP_HEIGHT }]}
                  >
                    <Text style={styles.chipLabel} numberOfLines={3}>
                      {c.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </Animated.View>
            );
          })}
        </View>
      ) : (
        <View style={{ height: 1 }} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  node: {
    position: "absolute",
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.bg,
  },
  nodeLatest: {
    borderWidth: 3,
    shadowColor: colors.primary,
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 0 },
    elevation: 2,
  },
  card: {
    position: "absolute",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    justifyContent: "center",
    gap: 3,
  },
  cardDate: { fontSize: 10.5, color: colors.textFaint, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.3 },
  cardDoctor: { fontSize: 14, fontWeight: "700", color: colors.text },
  cardSub: { fontSize: 11.5, color: colors.textMuted },
  chip: {
    position: "absolute",
    backgroundColor: colors.primaryTint,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  chipLabel: { fontSize: 9.5, fontWeight: "700", color: colors.primary, textAlign: "center", lineHeight: 11.5 },
});
