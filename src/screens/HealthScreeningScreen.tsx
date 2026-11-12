import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import Body3D from "../components/Body3D";
import FadeInUp from "../components/FadeInUp";
import { BackIcon, CalendarIcon, CapsuleIcon, WarningIcon, FlaskIcon } from "../components/icons";
import { prescriptions } from "../data/mockData";
import { screenPrescription, type BodyRegion } from "../lib/healthScreening";

type Props = NativeStackScreenProps<RootStackParamList, "HealthScreening">;

const c = {
  bg: "#0D0B0A",
  ink: "#F4EEE9",
  muted: "#B3A79F",
  faint: "#7D736C",
  accent: "#F59E5B",
  accentSoft: "#3A2618",
  card: "#1B1715",
  line: "#2E2723",
  sheet: "#141110",
};

const OVERVIEW = "Overview";

export default function HealthScreeningScreen({ navigation, route }: Props) {
  const rx = prescriptions.find((p) => p.id === route.params.prescriptionId) ?? prescriptions[0];
  const s = useMemo(() => screenPrescription(rx), [rx]);
  const [tab, setTab] = useState(OVERVIEW);
  const [showInfo, setShowInfo] = useState(false);

  const finding = s.findings.find((f) => f.system === tab);
  const regions: BodyRegion[] = finding ? [finding.region] : s.findings.map((f) => f.region);
  const focus = finding?.region ?? s.findings[0].region;
  const label = finding?.area ?? s.findings[0].area;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={styles.topBar}>
          <Pressable accessibilityLabel="Go back" style={styles.roundBtn} onPress={() => navigation.goBack()}>
            <BackIcon />
          </Pressable>
          <Pressable
            accessibilityLabel="About this screen"
            style={[styles.infoBtn, showInfo && { backgroundColor: c.accentSoft }]}
            onPress={() => setShowInfo((v) => !v)}
          >
            <Text style={styles.infoGlyph}>i</Text>
          </Pressable>
        </View>

        <Text style={styles.title}>Health Screening</Text>
        <Text style={styles.subtitle}>
          {s.memberName} · {rx.doctorName} · {rx.date}
        </Text>
        {showInfo ? (
          <Text style={styles.infoText}>
            This view shows the diagnosis your doctor wrote, mapped onto the body. It does not make a diagnosis. Ask your
            doctor about anything that worries you.
          </Text>
        ) : null}

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
          {[OVERVIEW, ...s.findings.map((f) => f.system)].map((t) => (
            <Pressable
              key={t}
              onPress={() => setTab(t)}
              accessibilityRole="tab"
              accessibilityState={{ selected: tab === t }}
              style={[styles.tab, tab === t && styles.tabOn]}
            >
              <Text style={[styles.tabLabel, tab === t && styles.tabLabelOn]}>{t}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <Body3D regions={regions} focus={focus} label={label} />

        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.grid}>
            <FadeInUp key={tab} style={styles.colTall}>
              <View style={[styles.card, { flex: 1 }]}>
                <View style={styles.iconBlob}>
                  <PersonIcon />
                </View>
                <View style={{ gap: 4 }}>
                  <Text style={styles.cardLabel}>{finding ? "Area affected" : "Areas affected"}</Text>
                  <Text style={styles.cardValue}>
                    {finding ? finding.area : s.findings.map((f) => f.area).join(", ")}
                  </Text>
                  <Text style={styles.cardNote}>{finding ? finding.detail : s.kind}</Text>
                </View>
              </View>
            </FadeInUp>

            <View style={styles.col}>
              <View style={styles.card}>
                <Text style={styles.cardLabel}>Treatment course</Text>
                <Text style={styles.cardValue}>
                  {s.course ? `Day ${s.course.day} of ${s.course.total}` : s.treatment.longest}
                </Text>
                {s.course ? (
                  <View style={styles.track}>
                    <View style={[styles.fill, { width: `${s.course.percent}%` }]} />
                  </View>
                ) : null}
              </View>
              <View style={styles.card}>
                <View style={[styles.iconBlob, styles.iconBlobSm]}>
                  <PlusGlyph />
                </View>
                <Text style={styles.cardLabel}>Doctor’s diagnosis</Text>
                <Text style={styles.cardValueSm}>{s.diagnosis}</Text>
              </View>
            </View>
          </View>

          <View style={styles.row}>
            <Stat
              label="Today's doses"
              value={s.dosesToday ? `${s.dosesToday.taken}/${s.dosesToday.total}` : "—"}
              note={s.dosesToday ? "taken" : "None scheduled"}
            />
            <Stat label="Medicines" value={String(s.treatment.count)} note={s.kind} />
            <Stat label="Follow-up" value={s.followUp ? s.followUp.slice(0, 6) : "—"} note={s.followUp ? "visit" : "Not set"} />
          </View>

          {s.watchFor.length ? (
            <View style={styles.card}>
              <View style={styles.inline}>
                <WarningIcon color="#F59E0B" />
                <Text style={styles.cardLabel}>Watch for</Text>
              </View>
              {s.watchFor.map((w) => (
                <Text key={w} style={styles.bullet}>
                  • {w}
                </Text>
              ))}
            </View>
          ) : null}

          <View style={styles.card}>
            <View style={styles.inline}>
              <CapsuleIcon size={16} color={c.accent} />
              <Text style={styles.cardLabel}>Prescribed</Text>
            </View>
            <View style={styles.chips}>
              {s.treatment.names.map((n) => (
                <View key={n} style={styles.chip}>
                  <Text style={styles.chipText}>{n}</Text>
                </View>
              ))}
            </View>
            {rx.followUp ? (
              <View style={[styles.inline, { marginTop: 10 }]}>
                <CalendarIcon color={c.muted} />
                <Text style={styles.cardNote}>Follow-up suggested on {rx.followUp}</Text>
              </View>
            ) : null}
          </View>

          {s.relatedLab ? (
            <View style={styles.card}>
              <View style={styles.inline}>
                <FlaskIcon size={16} color="#8B93F8" />
                <Text style={styles.cardLabel}>Latest lab report</Text>
              </View>
              <Text style={styles.cardValueSm}>{s.relatedLab.name}</Text>
              <Text style={styles.cardNote}>{s.relatedLab.summary}</Text>
            </View>
          ) : null}

          <Text style={styles.disclaimer}>
            Based on the diagnosis written on this prescription. Not a medical diagnosis.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <View style={[styles.card, styles.stat]}>
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.cardNote} numberOfLines={1}>
        {note}
      </Text>
    </View>
  );
}

function PersonIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#1F1A17" strokeWidth={1.8} strokeLinecap="round">
      <Circle cx={12} cy={4.5} r={2} />
      <Path d="M5 9l7 1 7-1M12 10v5M12 15l-3 6M12 15l3 6" />
    </Svg>
  );
}

function PlusGlyph() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#1F1A17" strokeWidth={2} strokeLinejoin="round">
      <Path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6z" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingTop: 10 },
  roundBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: c.card, alignItems: "center", justifyContent: "center" },
  infoBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: c.faint,
    alignItems: "center",
    justifyContent: "center",
  },
  infoGlyph: { fontSize: 14, fontWeight: "700", color: c.muted },
  title: { fontSize: 30, fontWeight: "600", color: c.ink, paddingHorizontal: 20, marginTop: 18, letterSpacing: -0.6 },
  subtitle: { fontSize: 13, color: c.muted, paddingHorizontal: 20, marginTop: 4 },
  infoText: {
    marginHorizontal: 20,
    marginTop: 10,
    padding: 12,
    borderRadius: 14,
    backgroundColor: c.accentSoft,
    fontSize: 12.5,
    lineHeight: 18,
    color: "#F5CBA7",
  },
  tabs: { gap: 8, paddingHorizontal: 20, paddingVertical: 14 },
  tab: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 99, borderWidth: 1, borderColor: c.line, backgroundColor: c.card },
  tabOn: { backgroundColor: c.accent, borderColor: c.accent },
  tabLabel: { fontSize: 13, fontWeight: "500", color: c.ink },
  tabLabelOn: { color: "#1F1A17", fontWeight: "600" },
  sheet: {
    marginTop: -12,
    backgroundColor: c.sheet,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 14,
    gap: 10,
  },
  handle: { alignSelf: "center", width: 40, height: 5, borderRadius: 3, backgroundColor: "#3A332E", marginBottom: 4 },
  grid: { flexDirection: "row", gap: 10 },
  colTall: { flex: 1 },
  col: { flex: 1, gap: 10 },
  card: { backgroundColor: c.card, borderRadius: 20, padding: 14, gap: 6 },
  iconBlob: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: c.accent,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  iconBlobSm: { width: 38, height: 38, borderRadius: 19, marginBottom: 6 },
  cardLabel: { fontSize: 13, color: c.muted },
  cardValue: { fontSize: 16, fontWeight: "700", color: c.ink, lineHeight: 21 },
  cardValueSm: { fontSize: 14, fontWeight: "700", color: c.ink, lineHeight: 19 },
  cardNote: { fontSize: 12, color: c.faint, lineHeight: 17 },
  track: { height: 6, borderRadius: 3, backgroundColor: c.accentSoft, marginTop: 4, overflow: "hidden" },
  fill: { height: 6, borderRadius: 3, backgroundColor: c.accent },
  row: { flexDirection: "row", gap: 10 },
  stat: { flex: 1, gap: 2 },
  statValue: { fontSize: 20, fontWeight: "700", color: c.ink, fontVariant: ["tabular-nums"] },
  inline: { flexDirection: "row", alignItems: "center", gap: 8 },
  bullet: { fontSize: 13, color: c.ink, lineHeight: 19 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 99, backgroundColor: c.accentSoft },
  chipText: { fontSize: 12, fontWeight: "600", color: "#F5B98A" },
  disclaimer: { fontSize: 11.5, color: c.faint, textAlign: "center", marginTop: 6 },
});
