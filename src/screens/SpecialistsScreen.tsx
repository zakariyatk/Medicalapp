import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import DoctorIllustration from "../components/DoctorIllustration";
import { BackIcon, HeartIcon, HeartPulseIcon, LungsIcon, BrainIcon, ChevronRightIcon } from "../components/icons";

type Props = NativeStackScreenProps<RootStackParamList, "Specialists">;

const ACCENT = "#E4435A";
const LOREM =
  "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet magna ";

export default function SpecialistsScreen({ navigation }: Props) {
  return (
    <LinearGradient colors={["#2A4A9E", "#182C6B", "#0C1A42"]} style={{ flex: 1 }}>
      <StatusBar style="light" />
      <SafeAreaView style={{ flex: 1 }}>
        {/* decorative background blobs */}
        <View pointerEvents="none" style={styles.blobTop} />
        <View pointerEvents="none" style={styles.blobRight} />

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <TouchableOpacity accessibilityLabel="Go back" onPress={() => navigation.goBack()} style={styles.backBtn}>
              <BackIcon color="#fff" size={18} />
            </TouchableOpacity>
            <Text style={styles.title}>Specialists</Text>
            <View style={styles.logoWrap}>
              <HeartPulseIcon size={26} color={ACCENT} />
              <View style={styles.logoBadge}>
                <HeartIcon size={12} color="#fff" />
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardIconCircle}>
              <HeartIcon size={24} color="#0F766E" />
            </View>
            <Text style={styles.cardTitle}>Cardiologist</Text>
            <Text style={styles.cardBody}>
              {LOREM}
              <Text style={styles.moreInfo}>More info...</Text>
            </Text>
            <TouchableOpacity accessibilityRole="button" style={styles.ctaBtn}>
              <Text style={styles.ctaText}>MAKE AN APPOINTMENT</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.illustrationRow}>
            <View style={styles.doctorWrap}>
              <DoctorIllustration width={180} height={262} />
            </View>

            <View style={styles.sideCards}>
              <TouchableOpacity accessibilityRole="button" style={styles.sideCard}>
                <View style={styles.sideCardTop}>
                  <View style={styles.sideIconCircle}>
                    <LungsIcon size={20} color="#0F766E" />
                  </View>
                  <ChevronRightIcon size={14} color={ACCENT} />
                </View>
                <Text style={styles.sideCardLabel}>Pneumology</Text>
              </TouchableOpacity>
              <TouchableOpacity accessibilityRole="button" style={styles.sideCard}>
                <View style={styles.sideCardTop}>
                  <View style={styles.sideIconCircle}>
                    <BrainIcon size={20} color="#0F766E" />
                  </View>
                  <ChevronRightIcon size={14} color={ACCENT} />
                </View>
                <Text style={styles.sideCardLabel}>Neurologist</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.footerText}>
            Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut
            laoreet dolore magna aliquam erat volutpat.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40 },
  blobTop: {
    position: "absolute",
    top: -120,
    left: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "#3C5FBE",
    opacity: 0.35,
  },
  blobRight: {
    position: "absolute",
    top: 160,
    right: -90,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "#24407F",
    opacity: 0.45,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  title: { color: "#fff", fontSize: 24, fontWeight: "800" },
  logoWrap: { flexDirection: "row", alignItems: "center" },
  logoBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: ACCENT,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -4,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  cardIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#EAF4F2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  cardTitle: { fontSize: 18, fontWeight: "800", color: "#1C2430", marginBottom: 6 },
  cardBody: { fontSize: 12.5, lineHeight: 18, color: "#8A94A6" },
  moreInfo: { color: ACCENT, fontWeight: "700" },
  ctaBtn: {
    marginTop: 16,
    height: 48,
    borderRadius: 24,
    backgroundColor: ACCENT,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaText: { color: "#fff", fontWeight: "800", fontSize: 13, letterSpacing: 0.5 },
  illustrationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  doctorWrap: { flex: 1.2, alignItems: "center" },
  sideCards: { flex: 1, gap: 14 },
  sideCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  sideCardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sideIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#EAF4F2",
    alignItems: "center",
    justifyContent: "center",
  },
  sideCardLabel: { fontSize: 13, fontWeight: "700", color: "#1C2430" },
  footerText: {
    marginTop: 24,
    fontSize: 12,
    lineHeight: 18,
    color: "rgba(255,255,255,0.6)",
    textAlign: "center",
  },
});
