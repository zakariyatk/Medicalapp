import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable, Animated } from "react-native";
import Svg, { Circle } from "react-native-svg";
import type { CompositeScreenProps } from "@react-navigation/native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { MainTabsParamList, RootStackParamList } from "../navigation/types";
import { MemberAvatar } from "../components/PersonIllustrations";
import FadeInUp from "../components/FadeInUp";
import AnimatedPressable from "../components/AnimatedPressable";
import { CheckIcon, ChevronRightIcon } from "../components/icons";
import { colors } from "../theme";
import { familyMembers, medicines, prescriptions, initialDoses } from "../data/mockData";

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabsParamList, "Dashboard">,
  NativeStackScreenProps<RootStackParamList>
>;

const ink = "#0D0D0D";
const grey = "#8A8A8A";
const faint = "#B8B8B8";
const hairline = "#EDEDED";
const track = "#F2F2F2";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function todayLabel(d = new Date()) {
  return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`.toUpperCase();
}

/** "9:30 PM" → { clock: "9:30", period: "PM" } */
function splitTime(time: string) {
  const [clock, period = ""] = time.split(" ");
  return { clock, period };
}

export default function DashboardScreen({ navigation }: Props) {
  const [doses, setDoses] = useState(initialDoses);
  const toggleDose = (id: string) =>
    setDoses((prev) => prev.map((d) => (d.id === id ? { ...d, taken: !d.taken } : d)));

  const me = familyMembers[0];
  const left = doses.filter((d) => !d.taken).length;

  // One ring per family member who has medicine today, in the order their first dose appears.
  const progress = useMemo(() => {
    const ids = [...new Set(doses.map((d) => d.memberId))];
    return ids.map((id) => {
      const member = familyMembers.find((m) => m.id === id);
      const mine = doses.filter((d) => d.memberId === id);
      return {
        id,
        name: id === me.id ? "You" : (member?.name.split(" ")[0] ?? "—"),
        color: member?.color ?? colors.primary,
        taken: mine.filter((d) => d.taken).length,
        total: mine.length,
      };
    });
  }, [doses, me.id]);

  const recent = prescriptions.slice(0, 2);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <FadeInUp>
          <View style={styles.topRow}>
            <Text style={styles.date}>{todayLabel()}</Text>
            <Pressable accessibilityLabel="Your profile" onPress={() => navigation.navigate("Profile")}>
              <MemberAvatar member={me} size={38} />
            </Pressable>
          </View>

          <Text style={styles.headline} accessibilityRole="header">
            {left === 0 ? "All done" : `${left} ${left === 1 ? "dose" : "doses"}`}
            {"\n"}
            <Text style={styles.headlineFaint}>{left === 0 ? "for today." : "left today."}</Text>
          </Text>
        </FadeInUp>

        <FadeInUp delay={80}>
          <View style={styles.ringRow}>
            <ProgressRings rings={progress} />
            <View style={styles.legend}>
              {progress.map((p) => (
                <View key={p.id} style={styles.legendRow}>
                  <View style={[styles.legendDot, { backgroundColor: p.color }]} />
                  <Text style={styles.legendName}>{p.name}</Text>
                  <Text style={styles.legendCount}>
                    {p.taken}/{p.total}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </FadeInUp>

        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Today</Text>
          <Text style={styles.sectionMeta}>
            {doses.length - left} of {doses.length} taken
          </Text>
        </View>
        <View style={styles.list}>
          {doses.map((d, i) => {
            const med = medicines[d.medicineId];
            const member = familyMembers.find((m) => m.id === d.memberId);
            return (
              <FadeInUp key={d.id} delay={140 + i * 70}>
                <DoseRow
                  time={d.time}
                  name={med.name}
                  detail={`${member?.name.split(" ")[0] ?? "—"} · ${med.dosage}`}
                  taken={d.taken}
                  onToggle={() => toggleDose(d.id)}
                  onOpen={() => navigation.navigate("MedicineDetail", { medicineId: d.medicineId, memberId: d.memberId })}
                />
              </FadeInUp>
            );
          })}
        </View>

        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Recent prescriptions</Text>
          <Pressable onPress={() => navigation.navigate("Records")} hitSlop={8}>
            <Text style={styles.link}>See all</Text>
          </Pressable>
        </View>
        <FadeInUp delay={140 + doses.length * 70 + 60}>
          <View style={styles.list}>
            {recent.map((rx) => {
              const member = familyMembers.find((m) => m.id === rx.memberId);
              const [day, month] = rx.date.split(" ");
              return (
                <AnimatedPressable
                  key={rx.id}
                  scaleTo={0.98}
                  style={styles.row}
                  onPress={() => navigation.navigate("PrescriptionDetail", { prescriptionId: rx.id })}
                >
                  <View style={styles.timeCol}>
                    <Text style={styles.timeBig}>{day}</Text>
                    <Text style={styles.timeSmall}>{month?.toUpperCase()}</Text>
                  </View>
                  <View style={styles.rowBody}>
                    <Text style={styles.rowTitle}>{rx.doctorName}</Text>
                    <Text style={styles.rowSub} numberOfLines={1}>
                      {rx.hospital.split(",")[0]} · {member?.name.split(" ")[0]} · {rx.medicineIds.length} {rx.medicineIds.length === 1 ? "medicine" : "medicines"}
                    </Text>
                  </View>
                  <ChevronRightIcon color={faint} />
                </AnimatedPressable>
              );
            })}
          </View>
        </FadeInUp>
      </ScrollView>
    </SafeAreaView>
  );
}

type Ring = { id: string; color: string; taken: number; total: number };

function ProgressRings({ rings }: { rings: Ring[] }) {
  const size = 96;
  const stroke = 8;
  const gap = 4;
  const c = size / 2;
  return (
    <Svg width={size} height={size} accessibilityLabel="Doses taken per family member">
      {rings.slice(0, 3).map((r, i) => {
        const radius = c - stroke / 2 - i * (stroke + gap);
        const circumference = 2 * Math.PI * radius;
        // A zero-length arc with round caps draws a dot, which marks the start of an empty ring.
        const arc = r.total ? (r.taken / r.total) * circumference : 0;
        return (
          <React.Fragment key={r.id}>
            <Circle cx={c} cy={c} r={radius} stroke={track} strokeWidth={stroke} fill="none" />
            <Circle
              cx={c}
              cy={c}
              r={radius}
              stroke={r.color}
              strokeWidth={stroke}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${Math.max(arc, 0.01)} ${circumference}`}
              transform={`rotate(-90 ${c} ${c})`}
            />
          </React.Fragment>
        );
      })}
    </Svg>
  );
}

function DoseRow({
  time,
  name,
  detail,
  taken,
  onToggle,
  onOpen,
}: {
  time: string;
  name: string;
  detail: string;
  taken: boolean;
  onToggle: () => void;
  onOpen: () => void;
}) {
  const { clock, period } = splitTime(time);
  const [fill] = useState(() => new Animated.Value(taken ? 1 : 0));

  useEffect(() => {
    Animated.spring(fill, { toValue: taken ? 1 : 0, useNativeDriver: true, speed: 24, bounciness: 10 }).start();
  }, [taken, fill]);

  return (
    <View style={styles.row}>
      <Pressable style={styles.rowMain} onPress={onOpen} accessibilityRole="button" accessibilityLabel={`${name}, ${time}`}>
        <View style={styles.timeCol}>
          <Text style={[styles.timeBig, taken && { color: faint }]}>{clock}</Text>
          <Text style={styles.timeSmall}>{period}</Text>
        </View>
        <View style={styles.rowBody}>
          <Text style={[styles.rowTitle, taken && styles.rowTitleDone]}>{name}</Text>
          <Text style={styles.rowSub}>{detail}</Text>
        </View>
      </Pressable>
      <Pressable
        onPress={onToggle}
        hitSlop={10}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: taken }}
        accessibilityLabel={taken ? `Mark ${name} as not taken` : `Mark ${name} as taken`}
        style={styles.tick}
      >
        <Animated.View style={[styles.tickFill, { opacity: fill, transform: [{ scale: fill }] }]}>
          <CheckIcon size={13} color="#fff" />
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFFFF" },
  topRow: {
    paddingHorizontal: 24,
    paddingTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  date: { fontSize: 12, fontWeight: "600", color: grey, letterSpacing: 0.8 },
  headline: {
    fontSize: 44,
    lineHeight: 46,
    fontWeight: "700",
    letterSpacing: -1.8,
    color: ink,
    paddingHorizontal: 24,
    marginTop: 18,
  },
  headlineFaint: { color: faint },
  ringRow: { flexDirection: "row", alignItems: "center", gap: 22, paddingHorizontal: 24, marginTop: 26 },
  legend: { gap: 9, flex: 1, maxWidth: 160 },
  legendRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendName: { fontSize: 13, color: ink, flex: 1 },
  legendCount: { fontSize: 13, fontWeight: "700", color: ink, fontVariant: ["tabular-nums"] },
  sectionHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: hairline,
  },
  sectionTitle: { fontSize: 12, fontWeight: "700", color: ink, letterSpacing: 0.8, textTransform: "uppercase" },
  sectionMeta: { fontSize: 12, color: grey },
  link: { fontSize: 12, fontWeight: "600", color: ink, textDecorationLine: "underline" },
  list: { paddingHorizontal: 24 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: hairline,
    gap: 12,
  },
  rowMain: { flex: 1, flexDirection: "row", alignItems: "center", gap: 12 },
  timeCol: { width: 54 },
  timeBig: { fontSize: 18, fontWeight: "700", color: ink, letterSpacing: -0.5, fontVariant: ["tabular-nums"] },
  timeSmall: { fontSize: 10, fontWeight: "700", color: "#9A9A9A", marginTop: 1, letterSpacing: 0.4 },
  rowBody: { flex: 1, gap: 2 },
  rowTitle: { fontSize: 15, fontWeight: "600", color: ink },
  rowTitleDone: { color: faint, textDecorationLine: "line-through" },
  rowSub: { fontSize: 12, color: grey },
  tick: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: ink,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  tickFill: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: ink,
    alignItems: "center",
    justifyContent: "center",
  },
});
