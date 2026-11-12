import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, SafeAreaView, ScrollView } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { PrimaryButton, SecondaryButton } from "../components/ui";
import { FatherIllustration, MotherIllustration, SonIllustration, DaughterIllustration } from "../components/PersonIllustrations";
import { colors, type } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export default function LoginScreen({ navigation }: Props) {
  const [contact, setContact] = useState("");

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.brandRow}>
          <View style={styles.logoMark}>
            <View style={styles.logoCross} />
            <View style={styles.logoCrossRot} />
          </View>
          <Text style={styles.brand}>MediFam</Text>
        </View>

        <View style={styles.heroWrap}>
          <View style={styles.heroBlob} />
          <View style={styles.heroRow}>
            <View style={{ marginRight: -8 }}>
              <MotherIllustration width={70} height={102} />
            </View>
            <View style={{ marginHorizontal: -6, zIndex: 1 }}>
              <FatherIllustration width={76} height={110} />
            </View>
            <View style={{ marginLeft: -8 }}>
              <SonIllustration width={54} height={79} />
            </View>
            <View style={{ marginLeft: -10 }}>
              <DaughterIllustration width={48} height={70} />
            </View>
          </View>
        </View>

        <Text style={styles.title}>Your family’s health,{"\n"}organized in one place</Text>
        <Text style={styles.subtitle}>
          Scan prescriptions, track medicines and share records with the people who care for you.
        </Text>

        <View style={{ gap: 14 }}>
          <View>
            <Text style={styles.label}>Mobile number or email</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 98765 43210"
              placeholderTextColor={colors.textFaint}
              value={contact}
              onChangeText={setContact}
              autoCapitalize="none"
            />
          </View>
          <PrimaryButton label="Continue" onPress={() => navigation.replace("MainTabs")} />
        </View>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <SecondaryButton label="Create a family account" onPress={() => navigation.replace("MainTabs")} />

        <Text style={styles.terms}>
          By continuing you agree to MediFam’s Terms &amp; Privacy Policy
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 28, paddingTop: 56, flexGrow: 1 },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 40 },
  logoMark: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  logoCross: { position: "absolute", width: 2.4, height: 16, backgroundColor: "#fff", borderRadius: 2 },
  logoCrossRot: {
    position: "absolute",
    width: 16,
    height: 2.4,
    backgroundColor: "#fff",
    borderRadius: 2,
  },
  brand: { fontSize: 20, fontWeight: "800", letterSpacing: -0.3, color: colors.text },
  heroWrap: { alignItems: "center", marginBottom: 18 },
  heroBlob: {
    position: "absolute",
    width: 220,
    height: 140,
    borderRadius: 100,
    backgroundColor: colors.primaryTint,
    top: -6,
  },
  heroRow: { flexDirection: "row", alignItems: "flex-end" },
  title: { ...type.h1, fontSize: 24, lineHeight: 31, textAlign: "center", marginBottom: 8, color: colors.text },
  subtitle: { fontSize: 14, color: colors.textMuted, textAlign: "center", lineHeight: 20, marginBottom: 32 },
  label: { fontSize: 13, fontWeight: "600", marginBottom: 6, color: colors.text },
  input: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    paddingHorizontal: 16,
    fontSize: 15,
    color: colors.text,
  },
  dividerRow: { flexDirection: "row", alignItems: "center", gap: 10, marginVertical: 28 },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.borderStrong },
  dividerText: { fontSize: 12, color: colors.textFaint },
  terms: { fontSize: 12, color: colors.textFaint, textAlign: "center", lineHeight: 18, marginTop: 28 },
});
