import React, { useState } from "react";
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { Card, IconButton, PrimaryButton } from "../components/ui";
import { XIcon, CameraIcon, PlusIcon, TrashIcon, DocumentIcon, GalleryIcon } from "../components/icons";
import { colors, type } from "../theme";
import { familyMembers } from "../data/mockData";
import { scheduleRemindersForMedicines } from "../lib/reminders";

type Props = NativeStackScreenProps<RootStackParamList, "AddEditRecord">;

type DraftMedicine = { id: number; name: string; dosage: string; frequency: string; duration: string };

const RECORD_TYPES = ["Prescription", "Lab report", "Vaccination"] as const;
const LAB_STATUSES = [
  { value: "normal", label: "Normal" },
  { value: "review", label: "Needs review" },
  { value: "pending", label: "Pending" },
] as const;

function slugify(text: string) {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || `record-${Date.now()}`;
}

export default function AddEditRecordScreen({ navigation, route }: Props) {
  const [recordType, setRecordType] = useState<(typeof RECORD_TYPES)[number]>(route.params?.recordType ?? "Prescription");
  const [memberId, setMemberId] = useState(route.params?.memberId ?? familyMembers[2].id);
  const [doctor, setDoctor] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [hospital, setHospital] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [itemName, setItemName] = useState("");
  const [labStatus, setLabStatus] = useState<(typeof LAB_STATUSES)[number]["value"]>("pending");
  const [nextId, setNextId] = useState(3);
  const [medicinesList, setMedicinesList] = useState<DraftMedicine[]>([
    { id: 1, name: "Amoxicillin 500mg", dosage: "1 capsule", frequency: "3x daily", duration: "5 days" },
    { id: 2, name: "Paracetamol 250mg", dosage: "1 tablet", frequency: "As needed", duration: "" },
  ]);
  const [attachedName, setAttachedName] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const isPrescription = recordType === "Prescription";
  const isLabReport = recordType === "Lab report";

  function addMedicine() {
    setMedicinesList((list) => [...list, { id: nextId, name: "", dosage: "", frequency: "", duration: "" }]);
    setNextId((n) => n + 1);
  }
  function removeMedicine(id: number) {
    setMedicinesList((list) => list.filter((m) => m.id !== id));
  }
  function updateMedicine(id: number, patch: Partial<DraftMedicine>) {
    setMedicinesList((list) => list.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }

  async function handleTakePhoto() {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (!result.canceled && result.assets[0]) setAttachedName(result.assets[0].fileName ?? "photo.jpg");
  }

  async function handleUploadFile() {
    const result = await DocumentPicker.getDocumentAsync({ type: ["application/pdf", "image/*"], copyToCacheDirectory: true });
    if (!result.canceled && result.assets[0]) setAttachedName(result.assets[0].name);
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (isPrescription) {
        const validMeds = medicinesList.filter((m) => m.name.trim().length > 0);
        const { scheduledCount, totalCount } = await scheduleRemindersForMedicines(
          validMeds.map((m) => ({
            medicineId: `draft-${slugify(m.name)}`,
            medicineName: m.name,
            dosage: m.dosage,
            frequency: m.frequency,
            duration: m.duration,
          }))
        );
        Alert.alert(
          "Prescription saved",
          totalCount === 0
            ? "Record saved."
            : `Reminders auto-scheduled for ${scheduledCount} of ${totalCount} medicine${totalCount === 1 ? "" : "s"}.`
        );
      } else {
        Alert.alert(isLabReport ? "Lab report saved" : "Record saved", "It's been added to this member's records.");
      }
      navigation.navigate("MemberProfile", { memberId });
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={styles.header}>
        <IconButton accessibilityLabel="Cancel and go back" onPress={() => navigation.goBack()}>
          <XIcon />
        </IconButton>
        <Text style={type.h1}>{route.params?.recordId ? "Edit record" : "Add medical record"}</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 48 }}>
        <View>
          <Text style={styles.label}>Record type</Text>
          <View style={styles.segment}>
            {RECORD_TYPES.map((t) => (
              <TouchableOpacity key={t} style={[styles.segmentBtn, recordType === t && styles.segmentBtnOn]} onPress={() => setRecordType(t)}>
                <Text style={[styles.segmentText, recordType === t && styles.segmentTextOn]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View>
          <Text style={styles.label}>Attach original document</Text>
          {attachedName ? (
            <View style={styles.attachedRow}>
              <View style={styles.attachedIconWrap}>
                <DocumentIcon color={colors.primary} />
              </View>
              <Text style={styles.attachedName} numberOfLines={1}>
                {attachedName}
              </Text>
              <TouchableOpacity accessibilityLabel="Remove attachment" onPress={() => setAttachedName(null)}>
                <XIcon size={14} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity style={styles.attachBtn} onPress={handleTakePhoto}>
                <CameraIcon size={22} color={colors.textFaint} />
                <Text style={styles.attachText}>Take photo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.attachBtn} onPress={handleUploadFile}>
                <GalleryIcon size={22} color={colors.textFaint} />
                <Text style={styles.attachText}>Upload PDF / image</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View>
          <Text style={styles.label}>Family member</Text>
          <View style={styles.pickerRow}>
            {familyMembers.map((m) => (
              <TouchableOpacity
                key={m.id}
                style={[styles.memberPill, memberId === m.id && { borderColor: colors.primary, backgroundColor: colors.primaryTint }]}
                onPress={() => setMemberId(m.id)}
              >
                <Text style={[styles.memberPillText, memberId === m.id && { color: colors.primary }]}>{m.name.split(" ")[0]}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {!isPrescription ? (
          <View>
            <Text style={styles.label}>{isLabReport ? "Test name" : "Vaccine name"}</Text>
            <TextInput
              style={styles.input}
              placeholder={isLabReport ? "e.g. Complete Blood Count" : "e.g. Influenza (Flu) vaccine"}
              placeholderTextColor={colors.textFaint}
              value={itemName}
              onChangeText={setItemName}
            />
          </View>
        ) : null}

        <View style={{ flexDirection: "row", gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>{isPrescription ? "Doctor name" : isLabReport ? "Ordered by (optional)" : "Given by (optional)"}</Text>
            <TextInput style={styles.input} placeholder="Dr. full name" placeholderTextColor={colors.textFaint} value={doctor} onChangeText={setDoctor} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>{isPrescription ? "Specialization" : "Notes"}</Text>
            <TextInput style={styles.input} placeholder={isPrescription ? "e.g. Cardiologist" : "Optional"} placeholderTextColor={colors.textFaint} value={specialization} onChangeText={setSpecialization} />
          </View>
        </View>

        <View>
          <Text style={styles.label}>{isPrescription ? "Hospital / Clinic name" : "Lab / Clinic name"}</Text>
          <TextInput style={styles.input} placeholder="e.g. Apollo Hospital" placeholderTextColor={colors.textFaint} value={hospital} onChangeText={setHospital} />
        </View>

        <View style={{ flexDirection: "row", gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Date</Text>
            <TextInput style={styles.input} placeholder="DD / MM / YYYY" placeholderTextColor={colors.textFaint} value={date} onChangeText={setDate} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Time</Text>
            <TextInput style={styles.input} placeholder="--:-- AM" placeholderTextColor={colors.textFaint} value={time} onChangeText={setTime} />
          </View>
        </View>

        {isLabReport ? (
          <View>
            <Text style={styles.label}>Result status</Text>
            <View style={styles.segment}>
              {LAB_STATUSES.map((s) => (
                <TouchableOpacity
                  key={s.value}
                  style={[styles.segmentBtn, labStatus === s.value && styles.segmentBtnOn]}
                  onPress={() => setLabStatus(s.value)}
                >
                  <Text style={[styles.segmentText, labStatus === s.value && styles.segmentTextOn]}>{s.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : null}

        {isPrescription ? (
          <>
            <View style={styles.medHeader}>
              <Text style={type.h3}>Medicines</Text>
              <TouchableOpacity style={styles.addMedBtn} onPress={addMedicine}>
                <PlusIcon size={14} />
                <Text style={styles.addMedText}>Add medicine</Text>
              </TouchableOpacity>
            </View>

            {medicinesList.map((m, i) => (
              <Card key={m.id} style={{ padding: 14, gap: 10 }}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                  <Text style={styles.medIndex}>MEDICINE {i + 1}</Text>
                  <TouchableOpacity accessibilityLabel="Remove medicine" onPress={() => removeMedicine(m.id)}>
                    <TrashIcon />
                  </TouchableOpacity>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Medicine name & strength"
                  placeholderTextColor={colors.textFaint}
                  value={m.name}
                  onChangeText={(v) => updateMedicine(m.id, { name: v })}
                />
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <TextInput style={[styles.input, { flex: 1 }]} placeholder="Dosage" placeholderTextColor={colors.textFaint} value={m.dosage} onChangeText={(v) => updateMedicine(m.id, { dosage: v })} />
                  <TextInput style={[styles.input, { flex: 1 }]} placeholder="Frequency (e.g. 3x daily)" placeholderTextColor={colors.textFaint} value={m.frequency} onChangeText={(v) => updateMedicine(m.id, { frequency: v })} />
                </View>
                <TextInput style={styles.input} placeholder="Duration (e.g. 5 days)" placeholderTextColor={colors.textFaint} value={m.duration} onChangeText={(v) => updateMedicine(m.id, { duration: v })} />
              </Card>
            ))}
            <Text style={styles.reminderHint}>Reminders are auto-scheduled from each medicine’s frequency and duration when you save.</Text>
          </>
        ) : null}

        <View>
          <Text style={styles.label}>{isPrescription ? "Doctor’s notes / instructions" : "Result summary"}</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            placeholder={isPrescription ? "Any additional instructions from the doctor" : "Summary of the result"}
            placeholderTextColor={colors.textFaint}
            value={notes}
            onChangeText={setNotes}
            multiline
          />
        </View>

        <PrimaryButton label={saving ? "Saving…" : "Save record"} onPress={handleSave} disabled={saving} />
        {saving ? <ActivityIndicator style={{ marginTop: -4 }} color={colors.primary} /> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", gap: 12, padding: 20 },
  label: { fontSize: 12, fontWeight: "600", marginBottom: 6, color: colors.text },
  segment: { flexDirection: "row", backgroundColor: colors.borderStrong, borderRadius: 10, padding: 3, gap: 3 },
  segmentBtn: { flex: 1, height: 38, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  segmentBtnOn: { backgroundColor: colors.surface },
  segmentText: { fontSize: 12.5, fontWeight: "600", color: colors.textMuted },
  segmentTextOn: { color: colors.primary },
  attachBtn: { flex: 1, height: 88, borderRadius: 12, borderWidth: 1.5, borderColor: colors.borderStrong, borderStyle: "dashed", backgroundColor: colors.surface, alignItems: "center", justifyContent: "center", gap: 6 },
  attachText: { fontSize: 11.5, color: colors.textMuted, fontWeight: "600", textAlign: "center" },
  attachedRow: { flexDirection: "row", alignItems: "center", gap: 10, height: 56, borderRadius: 12, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.surface, paddingHorizontal: 12 },
  attachedIconWrap: { width: 32, height: 32, borderRadius: 8, backgroundColor: colors.primaryTint, alignItems: "center", justifyContent: "center" },
  attachedName: { flex: 1, fontSize: 13, color: colors.text, fontWeight: "600" },
  pickerRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  memberPill: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1.5, borderColor: colors.borderStrong },
  memberPillText: { fontSize: 12.5, fontWeight: "600", color: colors.textMuted },
  input: { height: 48, borderRadius: 10, borderWidth: 1.5, borderColor: colors.borderStrong, paddingHorizontal: 14, fontSize: 14, color: colors.text, backgroundColor: colors.surface },
  textarea: { height: 84, paddingTop: 12, textAlignVertical: "top" },
  medHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  addMedBtn: { flexDirection: "row", alignItems: "center", gap: 5 },
  addMedText: { fontSize: 12.5, fontWeight: "700", color: colors.primary },
  medIndex: { fontSize: 12, fontWeight: "700", color: colors.textFaint },
  reminderHint: { fontSize: 11.5, color: colors.textMuted, marginTop: -6 },
});
