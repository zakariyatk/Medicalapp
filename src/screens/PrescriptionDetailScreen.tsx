import React from "react";
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { Card, IconButton } from "../components/ui";
import { BackIcon, EditIcon, ShareIcon, DoctorIcon, HospitalIcon, CalendarIcon, DocIcon, ChevronRightIcon, CapsuleIcon, TabletIcon, SachetIcon } from "../components/icons";
import { colors, type, warm } from "../theme";
import { prescriptions, medicines, familyMembers } from "../data/mockData";

type Props = NativeStackScreenProps<RootStackParamList, "PrescriptionDetail">;

const medIconFor = (id: string) => (id === "amoxicillin" ? CapsuleIcon : id === "paracetamol" ? TabletIcon : SachetIcon);
const medBgFor = (id: string) => (id === "amoxicillin" ? colors.primaryTint : id === "paracetamol" ? colors.amberTint : colors.indigoTint);

export default function PrescriptionDetailScreen({ navigation, route }: Props) {
  const rx = prescriptions.find((p) => p.id === route.params.prescriptionId) ?? prescriptions[0];
  const member = familyMembers.find((m) => m.id === rx.memberId);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={styles.topBar}>
        <IconButton accessibilityLabel="Back to profile" onPress={() => navigation.goBack()}>
          <BackIcon />
        </IconButton>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <IconButton accessibilityLabel="Edit prescription" onPress={() => navigation.navigate("AddEditRecord", { recordId: rx.id, memberId: rx.memberId })}>
            <EditIcon />
          </IconButton>
          <IconButton accessibilityLabel="Share prescription">
            <ShareIcon />
          </IconButton>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 4, gap: 14, paddingBottom: 40 }}>
        <View style={{ flexDirection: "row", gap: 6 }}>
          {member ? <Tag label={member.name} bg={colors.primaryTint} color={colors.primary} /> : null}
          <Tag label={rx.specialization} bg={colors.indigoTint} color={colors.indigo} />
        </View>

        <Card style={{ padding: 18 }}>
          <View style={{ flexDirection: "row", gap: 14 }}>
            <View style={styles.doctorIconWrap}>
              <DoctorIcon />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={type.h2}>{rx.doctorName}</Text>
              <Text style={styles.doctorSub}>MBBS, MD · {rx.specialization}</Text>
            </View>
          </View>
          <View style={styles.infoBlock}>
            <InfoRow icon={<HospitalIcon />} text={rx.hospital} />
            <InfoRow icon={<CalendarIcon />} text={`${rx.date} · ${rx.time}`} />
            {rx.followUp ? <InfoRow icon={<CalendarIcon />} text={`Follow-up suggested: ${rx.followUp}`} /> : null}
          </View>
        </Card>

        <TouchableOpacity
          accessibilityRole="button"
          style={styles.screeningBtn}
          onPress={() => navigation.navigate("HealthScreening", { prescriptionId: rx.id })}
        >
          <View style={styles.screeningDot} />
          <View style={{ flex: 1 }}>
            <Text style={styles.screeningTitle}>Health screening</Text>
            <Text style={styles.screeningSub}>{rx.diagnosis ? `${rx.diagnosis} · see it on the body` : "See this visit on a body map"}</Text>
          </View>
          <ChevronRightIcon color={warm.sub} />
        </TouchableOpacity>

        <View style={styles.scanRow}>
          <View style={styles.scanThumb}>
            <DocIcon color={colors.textFaint} />
            <Text style={styles.scanThumbLabel}>Scanned copy</Text>
          </View>
          <Text style={styles.scanHint}>Tap the original scan to view it full size or re-run text extraction.</Text>
        </View>

        <Text style={[type.h3, { marginTop: 6 }]}>Medicines prescribed ({rx.medicineIds.length})</Text>
        {rx.medicineIds.map((id) => {
          const med = medicines[id];
          const Icon = medIconFor(id);
          return (
            <TouchableOpacity key={id} onPress={() => navigation.navigate("MedicineDetail", { medicineId: id, prescriptionId: rx.id, memberId: rx.memberId })}>
              <Card style={styles.medRow}>
                <View style={[styles.medIcon, { backgroundColor: medBgFor(id) }]}>
                  <Icon size={22} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={type.bodyStrong}>{med.name}</Text>
                  <Text style={styles.medSub}>
                    {med.dosage} · {med.frequency} · {med.instructions.split(",")[0]}
                  </Text>
                </View>
                <ChevronRightIcon />
              </Card>
            </TouchableOpacity>
          );
        })}

        {rx.notes ? (
          <View style={styles.notesBox}>
            <Text style={styles.notesTitle}>Doctor’s notes</Text>
            <Text style={styles.notesText}>{rx.notes}</Text>
          </View>
        ) : null}
      </ScrollView>
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

function InfoRow({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
      {icon}
      <Text style={{ fontSize: 13, color: colors.text, flex: 1 }}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 20, paddingBottom: 0 },
  doctorIconWrap: { width: 48, height: 48, borderRadius: 12, backgroundColor: colors.primaryTint, alignItems: "center", justifyContent: "center" },
  doctorSub: { fontSize: 12.5, color: colors.textMuted, marginTop: 2 },
  infoBlock: { marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: colors.border, gap: 10 },
  scanRow: { flexDirection: "row", gap: 10 },
  scanThumb: { width: 72, height: 92, borderRadius: 12, backgroundColor: colors.borderStrong, borderWidth: 1, borderColor: colors.borderStrong, alignItems: "center", justifyContent: "center", gap: 4 },
  scanThumbLabel: { fontSize: 9.5, color: colors.textFaint },
  scanHint: { fontSize: 12, color: colors.textMuted, flex: 1, alignSelf: "center", lineHeight: 18 },
  medRow: { flexDirection: "row", gap: 12, alignItems: "center", padding: 14 },
  medIcon: { width: 46, height: 46, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  medSub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  notesBox: { padding: 16, borderRadius: 14, backgroundColor: colors.amberTint },
  notesTitle: { fontSize: 13, fontWeight: "700", color: colors.amberText, marginBottom: 6 },
  notesText: { fontSize: 12.5, color: colors.amberText, lineHeight: 19 },
  screeningBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 18,
    backgroundColor: warm.bg,
  },
  screeningDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: warm.dot, borderWidth: 3, borderColor: colors.bg },
  screeningTitle: { fontSize: 15, fontWeight: "700", color: warm.text },
  screeningSub: { fontSize: 12.5, color: warm.sub, marginTop: 2 },
});
