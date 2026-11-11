import React, { useState } from "react";
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { Avatar, Card, ScreenHeader } from "../components/ui";
import { PlusIcon, FlaskIcon } from "../components/icons";
import { colors, type } from "../theme";
import { familyMembers, prescriptions, medicines, labReports } from "../data/mockData";
import MemberTimeline, { TimelineVisit } from "../components/MemberTimeline";
import FadeInUp from "../components/FadeInUp";
import AnimatedPressable from "../components/AnimatedPressable";

type Props = NativeStackScreenProps<RootStackParamList, "MemberProfile">;

const TABS = ["Prescriptions", "Medicines", "Reports", "Vitals"];

export default function MemberProfileScreen({ navigation, route }: Props) {
  const member = familyMembers.find((m) => m.id === route.params.memberId) ?? familyMembers[0];
  const [tab, setTab] = useState("Prescriptions");
  const memberRx = prescriptions.filter((rx) => rx.memberId === member.id);
  const memberLabs = labReports.filter((lr) => lr.memberId === member.id);

  const timelineVisits: TimelineVisit[] = memberRx.map((rx) => ({
    id: rx.id,
    dateLabel: `${rx.date.toUpperCase()} · ${rx.time}`,
    doctorName: rx.doctorName,
    subLine: `${rx.specialization} · ${rx.hospital}`,
    medicines: rx.medicineIds.map((medId) => ({ id: medId, label: medicines[medId].name })),
    onPress: () => navigation.navigate("PrescriptionDetail", { prescriptionId: rx.id }),
    onPressMedicine: (medId: string) =>
      navigation.navigate("MedicineDetail", { medicineId: medId, prescriptionId: rx.id, memberId: member.id }),
  }));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenHeader title="Medical profile" onBack={() => navigation.goBack()} />

      <View style={styles.profileRow}>
        <Avatar initials={member.initials} color={member.color} size={60} />
        <View>
          <Text style={styles.name}>{member.name}</Text>
          <Text style={styles.sub}>
            {member.relation}
            {member.age ? ` · ${member.age} years old` : ""} · DOB {member.dob}
          </Text>
        </View>
      </View>

      <View style={styles.tagsRow}>
        {member.bloodGroup ? <Tag label={`Blood group: ${member.bloodGroup}`} bg={colors.primaryTint} color={colors.primary} /> : null}
        {(member.allergies ?? []).map((a) => (
          <Tag key={a} label={`Allergy: ${a}`} bg={colors.redTint} color={colors.red} />
        ))}
        {(member.conditions ?? []).map((c) => (
          <Tag key={c} label={c} bg={colors.amberTint} color={colors.amber} />
        ))}
      </View>

      <View style={styles.tabsRow}>
        {TABS.map((t) => (
          <TouchableOpacity key={t} onPress={() => setTab(t)}>
            <Text style={[styles.tab, tab === t && styles.tabActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        {tab === "Prescriptions" ? (
          memberRx.length === 0 ? (
            <Text style={styles.empty}>No prescriptions recorded yet.</Text>
          ) : (
            <>
              <Text style={styles.hint}>Visit history, newest first — tap a visit or a medicine to open it</Text>
              <MemberTimeline visits={timelineVisits} />
            </>
          )
        ) : tab === "Reports" ? (
          <>
            <Text style={styles.hint}>Lab tests and reports for {member.name.split(" ")[0]}</Text>
            <AnimatedPressable
              style={styles.uploadLabBtn}
              onPress={() => navigation.navigate("AddEditRecord", { memberId: member.id, recordType: "Lab report" })}
            >
              <FlaskIcon size={18} color={colors.indigo} />
              <Text style={styles.uploadLabBtnLabel}>Upload a lab report</Text>
            </AnimatedPressable>
            {memberLabs.length === 0 ? (
              <Text style={styles.empty}>No lab reports uploaded yet.</Text>
            ) : (
              <View style={{ gap: 10, marginTop: 14 }}>
                {memberLabs.map((lr, i) => (
                  <FadeInUp key={lr.id} delay={i * 80}>
                    <Card style={{ padding: 16 }}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                        <View style={styles.labIconWrap}>
                          <FlaskIcon size={18} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={type.bodyStrong}>{lr.testName}</Text>
                          <Text style={styles.labSub}>
                            {lr.labName} · {lr.date}
                          </Text>
                        </View>
                        <LabStatusTag status={lr.status} />
                      </View>
                      <Text style={styles.labSummary}>{lr.summary}</Text>
                      {lr.orderedBy ? <Text style={styles.labOrderedBy}>Ordered by {lr.orderedBy}</Text> : null}
                    </Card>
                  </FadeInUp>
                ))}
              </View>
            )}
          </>
        ) : (
          <Text style={styles.empty}>No {tab.toLowerCase()} recorded yet.</Text>
        )}
      </ScrollView>

      <TouchableOpacity
        accessibilityLabel="Add a new medical record"
        style={styles.fab}
        onPress={() => navigation.navigate("AddEditRecord", { memberId: member.id })}
      >
        <PlusIcon color="#fff" size={22} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function Tag({ label, bg, color }: { label: string; bg: string; color: string }) {
  return (
    <View style={{ backgroundColor: bg, paddingHorizontal: 9, paddingVertical: 3, borderRadius: 999 }}>
      <Text style={{ fontSize: 11, fontWeight: "600", color }}>{label}</Text>
    </View>
  );
}

const LAB_STATUS: Record<string, { label: string; bg: string; color: string }> = {
  normal: { label: "Normal", bg: colors.primaryTint, color: colors.primary },
  review: { label: "Needs review", bg: colors.amberTint, color: colors.amber },
  pending: { label: "Pending", bg: colors.indigoTint, color: colors.indigo },
};

function LabStatusTag({ status }: { status: string }) {
  const s = LAB_STATUS[status] ?? LAB_STATUS.pending;
  return <Tag label={s.label} bg={s.bg} color={s.color} />;
}

const styles = StyleSheet.create({
  profileRow: { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 20, marginTop: 6 },
  name: { fontSize: 17, fontWeight: "800", color: colors.text },
  sub: { fontSize: 12.5, color: colors.textMuted, marginTop: 2 },
  tagsRow: { flexDirection: "row", gap: 8, flexWrap: "wrap", paddingHorizontal: 20, marginTop: 14 },
  tabsRow: {
    flexDirection: "row",
    gap: 22,
    paddingHorizontal: 20,
    marginTop: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: { fontSize: 13, fontWeight: "600", color: colors.textFaint, paddingVertical: 10 },
  tabActive: { color: colors.primary, borderBottomWidth: 2, borderBottomColor: colors.primary },
  hint: { fontSize: 12, color: colors.textMuted, marginBottom: 16 },
  empty: { fontSize: 13, color: colors.textMuted, textAlign: "center", marginTop: 40 },
  uploadLabBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.indigo,
    borderStyle: "dashed",
  },
  uploadLabBtnLabel: { fontSize: 13.5, fontWeight: "700", color: colors.indigo },
  labIconWrap: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.indigoTint, alignItems: "center", justifyContent: "center" },
  labSub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  labSummary: { fontSize: 12.5, color: colors.text, marginTop: 10, lineHeight: 18 },
  labOrderedBy: { fontSize: 11.5, color: colors.textFaint, marginTop: 6 },
  fab: {
    position: "absolute",
    right: 24,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
});
