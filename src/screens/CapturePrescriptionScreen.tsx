import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { CameraIcon, GalleryIcon, DocumentIcon, XIcon, CheckCircleIcon, DocIcon, CapsuleIcon } from "../components/icons";
import { PrimaryButton, IconButton } from "../components/ui";
import { colors, type } from "../theme";
import { extractPrescriptionFromImage, ExtractedPrescription } from "../lib/prescriptionAI";
import { scheduleRemindersForMedicines } from "../lib/reminders";

function slugify(text: string) {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || `med-${Date.now()}`;
}

type Props = NativeStackScreenProps<RootStackParamList, "CapturePrescription">;
type Stage = "camera" | "scanning" | "review";

export default function CapturePrescriptionScreen({ navigation }: Props) {
  const [stage, setStage] = useState<Stage>("camera");
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [extracted, setExtracted] = useState<ExtractedPrescription | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [fileName, setFileName] = useState("prescription_scan.jpg");

  async function runExtraction(uri: string) {
    setPhotoUri(uri);
    setStage("scanning");
    setError(null);
    try {
      const result = await extractPrescriptionFromImage(uri);
      setExtracted(result);
      setStage("review");
    } catch {
      setError("Couldn't read this prescription. You can still fill it in manually.");
      setExtracted({ doctorName: "", hospital: "", date: "", time: "", diagnosis: "", medicines: [] });
      setStage("review");
    }
  }

  async function handleCapture() {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      setError("Camera permission is needed to scan a prescription.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (!result.canceled && result.assets[0]) {
      runExtraction(result.assets[0].uri);
    }
  }

  async function handleUpload() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setError("Photo library permission is needed to upload a prescription.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.7 });
    if (!result.canceled && result.assets[0]) {
      setFileName(result.assets[0].fileName ?? "prescription_scan.jpg");
      runExtraction(result.assets[0].uri);
    }
  }

  async function handleUploadPdf() {
    const result = await DocumentPicker.getDocumentAsync({ type: ["application/pdf", "image/*"], copyToCacheDirectory: true });
    if (!result.canceled && result.assets[0]) {
      setFileName(result.assets[0].name);
      runExtraction(result.assets[0].uri);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const meds = extracted?.medicines ?? [];
      const { scheduledCount, totalCount } = await scheduleRemindersForMedicines(
        meds.map((m) => ({
          medicineId: `draft-${slugify(m.name)}`,
          medicineName: m.name,
          dosage: m.dosage,
          frequency: m.frequency,
          duration: m.duration,
        }))
      );
      if (totalCount > 0) {
        Alert.alert("Prescription saved", `Reminders auto-scheduled for ${scheduledCount} of ${totalCount} medicine${totalCount === 1 ? "" : "s"}.`);
      }
      navigation.replace("PrescriptionDetail", { prescriptionId: "rx1" });
    } finally {
      setSaving(false);
    }
  }

  if (stage === "camera") {
    return (
      <SafeAreaView style={styles.cameraScreen}>
        <View style={styles.cameraTopBar}>
          <TouchableOpacity accessibilityLabel="Cancel" style={styles.darkIconBtn} onPress={() => navigation.goBack()}>
            <XIcon color="#fff" />
          </TouchableOpacity>
          <Text style={styles.cameraTitle}>Scan prescription</Text>
          <View style={{ width: 36 }} />
        </View>

        <View style={styles.frameArea}>
          <View style={styles.frameGuide}>
            <CameraIcon size={46} color="rgba(255,255,255,0.45)" />
          </View>
          <Text style={styles.frameHint}>Align the prescription within the frame</Text>
        </View>

        {error ? <Text style={styles.cameraError}>{error}</Text> : null}

        <View style={styles.cameraFooter}>
          <TouchableOpacity accessibilityLabel="Capture photo" style={styles.shutter} onPress={handleCapture} />
          <TouchableOpacity style={styles.uploadLink} onPress={handleUpload}>
            <GalleryIcon />
            <Text style={styles.uploadLinkText}>Upload from gallery instead</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.uploadLink} onPress={handleUploadPdf}>
            <DocumentIcon />
            <Text style={styles.uploadLinkText}>Upload a PDF prescription</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (stage === "scanning") {
    return (
      <SafeAreaView style={styles.scanningScreen}>
        {photoUri ? <Image source={{ uri: photoUri }} style={styles.scanningImage} /> : null}
        <View style={styles.scanningOverlay}>
          <ActivityIndicator color="#fff" size="large" />
          <Text style={styles.scanningText}>Reading prescription…</Text>
          <Text style={styles.scanningSub}>Finding doctor, hospital and medicine details</Text>
        </View>
      </SafeAreaView>
    );
  }

  // review
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={styles.reviewHeader}>
        <IconButton accessibilityLabel="Retake photo" onPress={() => setStage("camera")}>
          <XIcon />
        </IconButton>
        <Text style={type.h1}>Review scan</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, gap: 14, paddingBottom: 40 }}>
        {error ? (
          <Banner color={colors.amberText} bg={colors.amberTint} text={error} />
        ) : (
          <Banner color={colors.primaryDark} bg={colors.primaryTint} text="Prescription read successfully — check the details below" icon />
        )}

        <View style={styles.fileRow}>
          <View style={styles.filePreview}>
            <DocIcon color={colors.textFaint} />
          </View>
          <View>
            <Text style={type.smallStrong}>{fileName}</Text>
            <Text style={styles.fileSub}>Original file saved</Text>
          </View>
        </View>

        <Field label="Doctor name" value={extracted?.doctorName ?? ""} onChangeText={(v) => setExtracted((p) => p && { ...p, doctorName: v })} />
        <View style={{ flexDirection: "row", gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Field label="Hospital / Clinic" value={extracted?.hospital ?? ""} onChangeText={(v) => setExtracted((p) => p && { ...p, hospital: v })} />
          </View>
          <View style={{ flex: 1 }}>
            <Field label="Date & time" value={`${extracted?.date ?? ""} ${extracted?.time ?? ""}`.trim()} onChangeText={() => {}} />
          </View>
        </View>

        <Text style={type.h3}>Medicines detected</Text>
        {(extracted?.medicines ?? []).map((m, i) => (
          <View key={i} style={styles.medRow}>
            <View style={styles.medIcon}>
              <CapsuleIcon size={16} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={type.smallStrong}>{m.name}</Text>
              <Text style={styles.medSub}>
                {m.dosage} · {m.frequency}
                {m.duration ? ` · ${m.duration}` : ""}
              </Text>
            </View>
          </View>
        ))}

        <PrimaryButton label={saving ? "Saving…" : "Save to records"} onPress={handleSave} disabled={saving} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Banner({ text, color, bg, icon }: { text: string; color: string; bg: string; icon?: boolean }) {
  return (
    <View style={[styles.banner, { backgroundColor: bg }]}>
      {icon ? <CheckCircleIcon color={color} /> : null}
      <Text style={[styles.bannerText, { color }]}>{text}</Text>
    </View>
  );
}

function Field({
  label,
  value,
  onChangeText,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
}) {
  return (
    <View>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput style={styles.fieldInput} value={value} onChangeText={onChangeText} />
    </View>
  );
}

const styles = StyleSheet.create({
  cameraScreen: { flex: 1, backgroundColor: "#0B1220" },
  cameraTopBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 20 },
  darkIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  cameraTitle: { color: "#fff", fontSize: 14, fontWeight: "600" },
  frameArea: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 },
  frameGuide: {
    width: "100%",
    aspectRatio: 0.72,
    borderRadius: 20,
    borderWidth: 2.5,
    borderColor: "rgba(255,255,255,0.55)",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  frameHint: { color: "rgba(255,255,255,0.75)", fontSize: 13, marginTop: 16, textAlign: "center" },
  cameraError: { color: "#FCA5A5", fontSize: 12.5, textAlign: "center", marginBottom: 8, paddingHorizontal: 24 },
  cameraFooter: { alignItems: "center", gap: 18, paddingBottom: 34, paddingTop: 10 },
  shutter: { width: 72, height: 72, borderRadius: 36, backgroundColor: "#fff", borderWidth: 5, borderColor: "rgba(255,255,255,0.3)" },
  uploadLink: { flexDirection: "row", alignItems: "center", gap: 8 },
  uploadLinkText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  scanningScreen: { flex: 1, backgroundColor: "#0B1220" },
  scanningImage: { flex: 1, opacity: 0.4 },
  scanningOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center", gap: 10 },
  scanningText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  scanningSub: { color: "rgba(255,255,255,0.7)", fontSize: 12.5 },
  reviewHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 20 },
  banner: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 10, padding: 12 },
  bannerText: { fontSize: 12.5, flex: 1 },
  fileRow: { flexDirection: "row", gap: 12, alignItems: "center", backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 14 },
  filePreview: { width: 46, height: 58, borderRadius: 8, backgroundColor: "#EDEFF2", alignItems: "center", justifyContent: "center" },
  fileSub: { fontSize: 12, color: colors.textMuted, marginTop: 3 },
  fieldLabel: { fontSize: 12, fontWeight: "600", marginBottom: 5, color: colors.text },
  fieldInput: { height: 46, borderRadius: 10, borderWidth: 1.5, borderColor: colors.borderStrong, paddingHorizontal: 14, fontSize: 14, color: colors.text, backgroundColor: colors.surface },
  medRow: { flexDirection: "row", gap: 10, alignItems: "center", backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 12 },
  medIcon: { width: 34, height: 34, borderRadius: 8, backgroundColor: colors.primaryTint, alignItems: "center", justifyContent: "center" },
  medSub: { fontSize: 11.5, color: colors.textMuted, marginTop: 1 },
});
