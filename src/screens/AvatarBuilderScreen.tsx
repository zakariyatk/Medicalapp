import React, { useState } from "react";
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable, Image, ActivityIndicator } from "react-native";
import * as ImagePicker from "expo-image-picker";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { ScreenHeader, PrimaryButton } from "../components/ui";
import AvatarFace from "../components/AvatarFace";
import FadeInUp from "../components/FadeInUp";
import { CameraIcon, GalleryIcon } from "../components/icons";
import { colors } from "../theme";
import { familyMembers } from "../data/mockData";
import {
  AGE_GROUPS,
  FACIAL_HAIR,
  HAIR_COLORS,
  HAIR_STYLES,
  LABELS,
  SKIN_TONES,
  defaultTraits,
  removeAvatar,
  saveAvatar,
  useAvatarTraits,
  type AvatarTraits,
} from "../lib/avatar";
import { generateAvatarFromPhoto, type AvatarResult } from "../lib/avatarAI";

type Props = NativeStackScreenProps<RootStackParamList, "AvatarBuilder">;

const RESULT_NOTE: Record<AvatarResult["source"], string> = {
  ai: "Made from the photo. Change anything that doesn't look right.",
  estimate: "Skin and hair colour picked from the photo. Choose the hair style, beard and glasses below.",
  manual: "Choose the details below to match the photo.",
};

export default function AvatarBuilderScreen({ navigation, route }: Props) {
  const member = familyMembers.find((m) => m.id === route.params.memberId) ?? familyMembers[0];
  const firstName = member.id === "harish" ? "your" : `${member.name.split(" ")[0]}'s`;
  const saved = useAvatarTraits(member.id);

  const [traits, setTraits] = useState<AvatarTraits>(() => saved ?? defaultTraits(member));
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [working, setWorking] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof AvatarTraits>(key: K, value: AvatarTraits[K]) =>
    setTraits((t) => ({ ...t, [key]: value }));

  async function pick(from: "camera" | "library") {
    setError(null);
    const perm =
      from === "camera"
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setError(from === "camera" ? "Allow camera access to take a photo." : "Allow photo access to choose a photo.");
      return;
    }
    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
      base64: true,
    };
    const result =
      from === "camera" ? await ImagePicker.launchCameraAsync(options) : await ImagePicker.launchImageLibraryAsync(options);
    const asset = result.canceled ? undefined : result.assets[0];
    if (!asset) return;

    setPhotoUri(asset.uri);
    setWorking(true);
    setNote(null);
    try {
      const out = await generateAvatarFromPhoto(asset, traits);
      setTraits(out.traits);
      setNote(RESULT_NOTE[out.source]);
    } catch {
      setError("Couldn't create the avatar from this photo. Try another photo, or set the details below.");
    } finally {
      setWorking(false);
    }
  }

  function save() {
    saveAvatar(member.id, traits);
    navigation.goBack();
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenHeader title="Avatar from photo" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 48, gap: 18 }}>
        <FadeInUp>
          <View style={styles.preview}>
            <View style={styles.photoSlot}>
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={styles.photo} accessibilityLabel="Your photo" />
              ) : (
                <Text style={styles.photoHint}>Photo</Text>
              )}
            </View>
            <Text style={styles.arrow}>→</Text>
            <View style={[styles.avatarRing, { backgroundColor: `${member.color}1F` }]}>
              {working ? (
                <ActivityIndicator color={member.color} />
              ) : (
                <AvatarFace traits={traits} shirt={member.color} size={148} />
              )}
            </View>
          </View>
          <Text style={styles.title}>Make {firstName} avatar</Text>
          <Text style={styles.sub}>
            {working
              ? "Creating the avatar…"
              : (note ?? "Upload a clear photo of the face. We turn it into a cartoon that looks like them.")}
          </Text>
        </FadeInUp>

        <View style={styles.actions}>
          <Pressable style={[styles.action, styles.actionDark]} onPress={() => pick("library")} disabled={working}>
            <GalleryIcon size={16} color={colors.bg} />
            <Text style={styles.actionDarkLabel}>{photoUri ? "Choose another" : "Upload photo"}</Text>
          </Pressable>
          <Pressable style={styles.action} onPress={() => pick("camera")} disabled={working}>
            <CameraIcon size={16} color={colors.text} />
            <Text style={styles.actionLabel}>Take a selfie</Text>
          </Pressable>
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Text style={styles.privacy}>{"The photo is only used to make the avatar. It isn't saved in the app."}</Text>

        <Section title="Skin tone">
          {(Object.keys(SKIN_TONES) as (keyof typeof SKIN_TONES)[]).map((k) => (
            <Swatch key={k} color={SKIN_TONES[k]} label={LABELS[k]} selected={traits.skin === k} onPress={() => set("skin", k)} />
          ))}
        </Section>
        <Section title="Hair colour">
          {(Object.keys(HAIR_COLORS) as (keyof typeof HAIR_COLORS)[]).map((k) => (
            <Swatch key={k} color={HAIR_COLORS[k]} label={LABELS[k]} selected={traits.hairColor === k} onPress={() => set("hairColor", k)} />
          ))}
        </Section>
        <Section title="Hair style">
          {HAIR_STYLES.map((k) => (
            <Chip key={k} label={LABELS[k]} selected={traits.hairStyle === k} onPress={() => set("hairStyle", k)} />
          ))}
        </Section>
        <Section title="Beard">
          {FACIAL_HAIR.map((k) => (
            <Chip key={k} label={LABELS[k]} selected={traits.facialHair === k} onPress={() => set("facialHair", k)} />
          ))}
        </Section>
        <Section title="Glasses">
          <Chip label="No glasses" selected={!traits.glasses} onPress={() => set("glasses", false)} />
          <Chip label="Glasses" selected={traits.glasses} onPress={() => set("glasses", true)} />
        </Section>
        <Section title="Age">
          {AGE_GROUPS.map((k) => (
            <Chip key={k} label={LABELS[k]} selected={traits.ageGroup === k} onPress={() => set("ageGroup", k)} />
          ))}
        </Section>

        <PrimaryButton label="Save avatar" onPress={save} disabled={working} />
        {saved ? (
          <Pressable
            onPress={() => {
              removeAvatar(member.id);
              navigation.goBack();
            }}
            style={{ alignSelf: "center", padding: 6 }}
          >
            <Text style={styles.reset}>Go back to the default character</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 10 }}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.wrap}>{children}</View>
    </View>
  );
}

function Swatch({ color, label, selected, onPress }: { color: string; label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      style={[styles.swatchRing, selected && { borderColor: colors.text }]}
    >
      <View style={[styles.swatch, { backgroundColor: color }]} />
    </Pressable>
  );
}

function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      style={[styles.chip, selected && styles.chipOn]}
    >
      <Text style={[styles.chipLabel, selected && styles.chipLabelOn]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  preview: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 14 },
  photoSlot: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  photo: { width: 92, height: 92 },
  photoHint: { fontSize: 12, color: colors.textFaint, fontWeight: "600" },
  arrow: { fontSize: 20, color: colors.textFaint },
  avatarRing: {
    width: 148,
    height: 148,
    borderRadius: 74,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 22, fontWeight: "800", color: colors.text, textAlign: "center", marginTop: 16 },
  sub: { fontSize: 13.5, color: colors.textMuted, textAlign: "center", marginTop: 6, lineHeight: 19, paddingHorizontal: 10 },
  actions: { flexDirection: "row", gap: 10 },
  action: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  actionDark: { backgroundColor: colors.text, borderColor: colors.text },
  actionLabel: { fontSize: 14, fontWeight: "700", color: colors.text },
  actionDarkLabel: { fontSize: 14, fontWeight: "700", color: colors.bg },
  error: { fontSize: 13, color: colors.red, textAlign: "center" },
  privacy: { fontSize: 11.5, color: colors.textFaint, textAlign: "center", marginTop: -8 },
  sectionTitle: { fontSize: 12, fontWeight: "700", color: colors.text, letterSpacing: 0.8, textTransform: "uppercase" },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  swatchRing: { padding: 3, borderRadius: 22, borderWidth: 2, borderColor: "transparent" },
  swatch: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.12)" },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 99,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  chipOn: { backgroundColor: colors.text, borderColor: colors.text },
  chipLabel: { fontSize: 13, fontWeight: "600", color: colors.text },
  chipLabelOn: { color: colors.bg },
  reset: { fontSize: 13, color: colors.textMuted, textDecorationLine: "underline" },
});
