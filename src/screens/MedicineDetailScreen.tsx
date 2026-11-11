import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Image } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { Card, IconButton } from "../components/ui";
import FadeInUp from "../components/FadeInUp";
import { BackIcon, BellIcon, CapsuleIcon, WarningIcon, DangerIcon, HospitalIcon, ChevronRightIcon, SparkleIcon } from "../components/icons";
import { colors, type } from "../theme";
import { medicines, prescriptions } from "../data/mockData";
import { isReminderActive, scheduleMedicineReminders, cancelMedicineReminders } from "../lib/reminders";
import { generateMedicineImage } from "../lib/medicineImage";

type Props = NativeStackScreenProps<RootStackParamList, "MedicineDetail">;

export default function MedicineDetailScreen({ navigation, route }: Props) {
  const med = medicines[route.params.medicineId] ?? Object.values(medicines)[0];
  const rx = route.params.prescriptionId ? prescriptions.find((p) => p.id === route.params.prescriptionId) : undefined;

  const [reminderOn, setReminderOn] = useState(false);
  const [reminderBusy, setReminderBusy] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBusy, setImageBusy] = useState(false);
  const [imageNote, setImageNote] = useState<string | null>(null);

  useEffect(() => {
    isReminderActive(med.id).then(setReminderOn);
  }, [med.id]);

  async function toggleReminder() {
    setReminderBusy(true);
    try {
      if (reminderOn) {
        await cancelMedicineReminders(med.id);
        setReminderOn(false);
        Alert.alert("Reminders turned off", `You won't get reminders for ${med.name} anymore.`);
      } else {
        const result = await scheduleMedicineReminders({
          medicineId: med.id,
          medicineName: med.name,
          dosage: med.dosage,
          frequency: med.frequency,
          duration: med.duration,
        });
        setReminderOn(result.scheduled);
        if (result.scheduled) {
          Alert.alert("Reminders set", `${result.count} reminder${result.count === 1 ? "" : "s"} scheduled for ${med.name}, based on "${med.frequency}" for "${med.duration}".`);
        } else {
          Alert.alert("Couldn't auto-schedule", result.reason ?? "Try setting this one manually.");
        }
      }
    } finally {
      setReminderBusy(false);
    }
  }

  async function handleGenerateImage() {
    setImageBusy(true);
    setImageNote(null);
    const result = await generateMedicineImage(med.name, med.form);
    setImageBusy(false);
    if (result) {
      setImageUri(result.uri);
    } else {
      setImageNote("Photo generation isn't connected to an image provider yet — ask to have this wired up.");
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={styles.topBar}>
        <IconButton accessibilityLabel="Back to prescription" onPress={() => navigation.goBack()}>
          <BackIcon />
        </IconButton>
        <TouchableOpacity
          accessibilityLabel={reminderOn ? "Turn off reminders" : "Set reminder"}
          onPress={toggleReminder}
          disabled={reminderBusy}
          style={[styles.iconBtn, reminderOn && styles.iconBtnOn]}
        >
          {reminderBusy ? <ActivityIndicator size="small" color={reminderOn ? "#fff" : colors.text} /> : <BellIcon color={reminderOn ? "#fff" : colors.text} />}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 4, paddingBottom: 40 }}>
        <FadeInUp>
          <View style={styles.headRow}>
            <TouchableOpacity onPress={handleGenerateImage} disabled={imageBusy} style={styles.medIconBig}>
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={{ width: "100%", height: "100%", borderRadius: 16 }} />
              ) : imageBusy ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <>
                  <CapsuleIcon size={26} />
                  <View style={styles.sparkleBadge}>
                    <SparkleIcon size={11} color="#fff" />
                  </View>
                </>
              )}
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={styles.medName}>{med.name}</Text>
              <Text style={styles.medSub}>Generic: {med.genericName}</Text>
              <Text style={styles.medSub}>
                {med.form} · {med.manufacturer}
              </Text>
            </View>
          </View>
          {imageNote ? <Text style={styles.imageNote}>{imageNote}</Text> : null}

          <Text style={styles.reminderStatus}>
            {reminderOn ? "🔔 Reminders are on for this medicine" : "Tap the bell above to auto-schedule reminders for this medicine"}
          </Text>
        </FadeInUp>

        <FadeInUp delay={60}>
          <View style={styles.tagsRow}>
            <Tag label={med.category} bg={colors.primaryTint} color={colors.primary} />
            <Tag label="Prescription only" bg={colors.indigoTint} color={colors.indigo} />
          </View>
        </FadeInUp>

        <FadeInUp delay={120}>
          <Card style={{ padding: 16, marginTop: 16 }}>
            <Text style={type.h3}>How to take</Text>
            <View style={{ marginTop: 12, gap: 10 }}>
              <InfoLine text={`${med.dosage}, ${med.frequency}`} />
              <InfoLine text={med.instructions} />
              <InfoLine text={`Course length: ${med.duration}`} />
            </View>
          </Card>
        </FadeInUp>

        <FadeInUp delay={180}>
          <Text style={[type.h3, { marginTop: 22, marginBottom: 10 }]}>Possible side effects</Text>
          <View style={{ gap: 8 }}>
            {med.sideEffectsCommon.map((s, i) => (
              <View key={`c${i}`} style={[styles.sideEffect, { backgroundColor: colors.amberTint }]}>
                <WarningIcon />
                <Text style={[styles.sideEffectText, { color: colors.amberText }]}>Common — {s}</Text>
              </View>
            ))}
            {med.sideEffectsSerious.map((s, i) => (
              <View key={`s${i}`} style={[styles.sideEffect, { backgroundColor: colors.redTint }]}>
                <DangerIcon />
                <Text style={[styles.sideEffectText, { color: colors.red }]}>Serious — {s}</Text>
              </View>
            ))}
          </View>
        </FadeInUp>

        {med.allergyWarning ? (
          <FadeInUp delay={220}>
            <View style={styles.allergyBox}>
              <DangerIcon color={colors.red} size={18} />
              <Text style={styles.allergyText}>
                <Text style={{ fontWeight: "700" }}>Allergy flag: </Text>
                {med.allergyWarning}
              </Text>
            </View>
          </FadeInUp>
        ) : null}

        {rx ? (
          <FadeInUp delay={260}>
            <Card style={{ padding: 16, marginTop: 16 }}>
              <Text style={type.h3}>Prescribed in</Text>
              <TouchableOpacity
                style={{ flexDirection: "row", alignItems: "center", gap: 10, marginTop: 10 }}
                onPress={() => navigation.navigate("PrescriptionDetail", { prescriptionId: rx.id })}
              >
                <View style={styles.rxIconWrap}>
                  <HospitalIcon color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={type.smallStrong}>
                    {rx.doctorName} · {rx.date}
                  </Text>
                  <Text style={styles.rxSub}>{rx.hospital}</Text>
                </View>
                <ChevronRightIcon />
              </TouchableOpacity>
            </Card>
          </FadeInUp>
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

function InfoLine({ text }: { text: string }) {
  return (
    <View style={{ flexDirection: "row", gap: 10, alignItems: "flex-start" }}>
      <View style={styles.dot} />
      <Text style={{ fontSize: 13, color: colors.text, flex: 1 }}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 20, paddingBottom: 0 },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBtnOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  headRow: { flexDirection: "row", gap: 14, alignItems: "center", marginTop: 12 },
  medIconBig: {
    width: 68,
    height: 68,
    borderRadius: 16,
    backgroundColor: colors.primaryTint,
    borderWidth: 1,
    borderColor: "#D7ECE9",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  sparkleBadge: {
    position: "absolute",
    right: -4,
    bottom: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.indigo,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.bg,
  },
  imageNote: { fontSize: 11.5, color: colors.textMuted, marginTop: 8 },
  reminderStatus: { fontSize: 12, color: colors.textMuted, marginTop: 10 },
  medName: { fontSize: 18, fontWeight: "800", color: colors.text },
  medSub: { fontSize: 12.5, color: colors.textMuted, marginTop: 2 },
  tagsRow: { flexDirection: "row", gap: 8, marginTop: 14 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary, marginTop: 6 },
  sideEffect: { flexDirection: "row", gap: 8, alignItems: "flex-start", padding: 11, borderRadius: 10 },
  sideEffectText: { fontSize: 12.5, flex: 1 },
  allergyBox: { marginTop: 16, padding: 14, borderRadius: 14, backgroundColor: colors.redTint, flexDirection: "row", gap: 10, alignItems: "flex-start" },
  allergyText: { fontSize: 12.5, color: colors.redText, flex: 1, lineHeight: 19 },
  rxIconWrap: { width: 34, height: 34, borderRadius: 9, backgroundColor: colors.primaryTint, alignItems: "center", justifyContent: "center" },
  rxSub: { fontSize: 11.5, color: colors.textMuted, marginTop: 1 },
});
