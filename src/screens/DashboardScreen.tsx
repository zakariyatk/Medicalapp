import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Animated } from "react-native";
import type { CompositeScreenProps } from "@react-navigation/native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { MainTabsParamList, RootStackParamList } from "../navigation/types";
import { Card } from "../components/ui";
import { MemberAvatar } from "../components/PersonIllustrations";
import FadeInUp from "../components/FadeInUp";
import AnimatedPressable from "../components/AnimatedPressable";
import { BellIcon, PlusIcon, CheckIcon, CapsuleIcon, TabletIcon, SachetIcon } from "../components/icons";
import { colors, type, shadow } from "../theme";
import { familyMembers, medicines, prescriptions, initialDoses } from "../data/mockData";

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabsParamList, "Dashboard">,
  NativeStackScreenProps<RootStackParamList>
>;

export default function DashboardScreen({ navigation }: Props) {
  const [doses, setDoses] = useState(initialDoses);
  const toggleDose = (id: string) =>
    setDoses((prev) => prev.map((d) => (d.id === id ? { ...d, taken: !d.taken } : d)));

  const recent = prescriptions.slice(0, 2);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <FadeInUp>
          <View style={styles.topRow}>
            <View>
              <Text style={styles.greetSmall}>Good morning</Text>
              <Text style={styles.greetName}>Harish Sakariya</Text>
            </View>
            <TouchableOpacity accessibilityLabel="Notifications" style={styles.bellBtn}>
              <BellIcon />
              <View style={styles.bellDot} />
            </TouchableOpacity>
          </View>
        </FadeInUp>

        <FadeInUp delay={60}>
          <View style={styles.memberRow}>
            {familyMembers.slice(0, 4).map((m) => (
              <AnimatedPressable
                key={m.id}
                style={styles.memberChip}
                onPress={() => navigation.navigate("MemberProfile", { memberId: m.id })}
              >
                <MemberAvatar member={m} size={52} />
                <Text style={styles.memberChipLabel}>{m.id === "harish" ? "You" : m.name.split(" ")[0]}</Text>
              </AnimatedPressable>
            ))}
            <AnimatedPressable
              accessibilityLabel="Add family member"
              style={styles.memberChip}
              onPress={() => navigation.navigate("FamilyMembers")}
            >
              <View style={styles.addChip}>
                <PlusIcon color={colors.textFaint} />
              </View>
              <Text style={[styles.memberChipLabel, { color: colors.textFaint }]}>Add</Text>
            </AnimatedPressable>
          </View>
        </FadeInUp>

        <FadeInUp delay={120}>
          <View style={styles.statsRow}>
            <Card style={styles.statCard}>
              <Text style={[styles.statNum, { color: colors.primary }]}>{familyMembers.length}</Text>
              <Text style={styles.statLabel}>Family members</Text>
            </Card>
            <Card style={styles.statCard}>
              <Text style={[styles.statNum, { color: colors.primary }]}>{prescriptions.length}</Text>
              <Text style={styles.statLabel}>Active prescriptions</Text>
            </Card>
            <Card style={styles.statCard}>
              <Text style={[styles.statNum, { color: colors.amber }]}>{doses.filter((d) => !d.taken).length}</Text>
              <Text style={styles.statLabel}>Doses due today</Text>
            </Card>
          </View>
        </FadeInUp>

        <View style={styles.sectionHeader}>
          <Text style={type.h2}>Today’s medicines</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingLeft: 20 }}>
          {doses.map((d, i) => {
            const med = medicines[d.medicineId];
            const member = familyMembers.find((m) => m.id === d.memberId);
            return (
              <MedicineDoseCard
                key={d.id}
                medicineName={med.name}
                medicineId={d.medicineId}
                memberFirstName={member?.name.split(" ")[0] ?? "—"}
                memberInitials={member?.initials ?? "?"}
                dosage={med.dosage}
                time={d.time}
                color={member?.color ?? colors.primary}
                taken={d.taken}
                delay={180 + i * 90}
                onPress={() => toggleDose(d.id)}
              />
            );
          })}
          <View style={{ width: 20 }} />
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={type.h2}>Recent prescriptions</Text>
        </View>
        <FadeInUp delay={180 + doses.length * 90 + 80}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingLeft: 20 }}>
            {recent.map((rx) => (
              <AnimatedPressable key={rx.id} onPress={() => navigation.navigate("PrescriptionDetail", { prescriptionId: rx.id })}>
                <Card style={styles.rxCard}>
                  <Text style={styles.rxDate}>{rx.date.toUpperCase()}</Text>
                  <Text style={styles.rxDoctor}>{rx.doctorName}</Text>
                  <Text style={styles.rxSub}>
                    {rx.hospital.split(",")[0]} · {familyMembers.find((m) => m.id === rx.memberId)?.name.split(" ")[0]}
                  </Text>
                  <Text style={styles.rxMeds}>{rx.medicineIds.length} medicines</Text>
                </Card>
              </AnimatedPressable>
            ))}
            <View style={{ width: 20 }} />
          </ScrollView>
        </FadeInUp>
      </ScrollView>
    </SafeAreaView>
  );
}

function MedicineIcon({ medicineId, size, color }: { medicineId: string; size: number; color: string }) {
  if (medicineId === "paracetamol") return <TabletIcon size={size} color={color} />;
  if (medicineId === "ors") return <SachetIcon size={size} color={color} />;
  return <CapsuleIcon size={size} color={color} />;
}

function MedicineDoseCard({
  medicineName,
  medicineId,
  memberFirstName,
  memberInitials,
  dosage,
  time,
  color,
  taken,
  delay = 0,
  onPress,
}: {
  medicineName: string;
  medicineId: string;
  memberFirstName: string;
  memberInitials: string;
  dosage: string;
  time: string;
  color: string;
  taken: boolean;
  delay?: number;
  onPress: () => void;
}) {
  const [pop] = useState(() => new Animated.Value(0));
  const [checkPop] = useState(() => new Animated.Value(taken ? 1 : 0));

  useEffect(() => {
    const anim = Animated.spring(pop, { toValue: 1, useNativeDriver: true, delay, speed: 14, bounciness: 8 });
    anim.start();
    return () => anim.stop();
  }, [pop, delay]);

  useEffect(() => {
    Animated.spring(checkPop, { toValue: taken ? 1 : 0, useNativeDriver: true, speed: 26, bounciness: 10 }).start();
  }, [taken, checkPop]);

  return (
    <Animated.View
      style={{
        opacity: pop,
        transform: [{ scale: pop.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) }],
      }}
    >
      <AnimatedPressable onPress={onPress} style={styles.medCard}>
        <View style={[styles.medCardArt, { backgroundColor: `${color}1F` }]}>
          <View style={styles.medCardIndex}>
            <Text style={[styles.medCardIndexLabel, { color }]}>{memberInitials}</Text>
            <MedicineIcon medicineId={medicineId} size={12} color={color} />
          </View>
          <MedicineIcon medicineId={medicineId} size={44} color={color} />
          <Animated.View style={[styles.medCardCheckOverlay, { opacity: checkPop }]}>
            <View style={styles.medCardCheckDot}>
              <CheckIcon size={16} color="#fff" />
            </View>
          </Animated.View>
        </View>
        <View style={styles.medCardBody}>
          <Text style={styles.medCardName} numberOfLines={2}>
            {medicineName}
          </Text>
          <Text style={styles.medCardSub}>
            {memberFirstName} · {dosage}
          </Text>
          <Text style={styles.medCardTime}>{time}</Text>
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  topRow: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  greetSmall: { fontSize: 13, color: colors.textMuted },
  greetName: { fontSize: 21, fontWeight: "800", marginTop: 2, color: colors.text },
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  bellDot: {
    position: "absolute",
    top: 9,
    right: 10,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.amber,
  },
  memberRow: { flexDirection: "row", paddingLeft: 20, paddingTop: 2 },
  memberChip: { alignItems: "center", marginRight: 14 },
  memberChipLabel: { fontSize: 11, marginTop: 6, color: colors.text, fontWeight: "600" },
  addChip: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: "#C7CDD4",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  statsRow: { flexDirection: "row", gap: 10, paddingHorizontal: 20, marginTop: 18 },
  statCard: { flex: 1, padding: 14 },
  statNum: { fontSize: 20, fontWeight: "800" },
  statLabel: { fontSize: 11.5, color: colors.textMuted, marginTop: 2 },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  medCard: {
    width: 150,
    marginRight: 12,
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    ...shadow.card,
  },
  medCardArt: {
    height: 104,
    alignItems: "center",
    justifyContent: "center",
  },
  medCardIndex: {
    position: "absolute",
    left: 10,
    top: 8,
    alignItems: "center",
    gap: 2,
  },
  medCardIndexLabel: { fontSize: 13, fontWeight: "800" },
  medCardCheckOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(28,36,48,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  medCardCheckDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  medCardBody: { padding: 12, gap: 3 },
  medCardName: { fontSize: 13, fontWeight: "800", color: colors.text, lineHeight: 17 },
  medCardSub: { fontSize: 11, color: colors.textMuted },
  medCardTime: { fontSize: 11, color: colors.textFaint, fontWeight: "600", marginTop: 2 },
  rxCard: { width: 220, padding: 14, marginRight: 12 },
  rxDate: { fontSize: 11, color: colors.textFaint, fontWeight: "600", letterSpacing: 0.3 },
  rxDoctor: { fontSize: 14, fontWeight: "700", marginTop: 6, color: colors.text },
  rxSub: { fontSize: 12, color: colors.textMuted, marginTop: 3 },
  rxMeds: { fontSize: 12, color: colors.primary, fontWeight: "600", marginTop: 10 },
});
