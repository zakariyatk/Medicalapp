import React from "react";
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from "react-native";
import type { CompositeScreenProps } from "@react-navigation/native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { MainTabsParamList, RootStackParamList } from "../navigation/types";
import { Avatar, Card } from "../components/ui";
import { ChevronRightIcon } from "../components/icons";
import { colors, type } from "../theme";
import { familyMembers } from "../data/mockData";

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabsParamList, "Profile">,
  NativeStackScreenProps<RootStackParamList>
>;

const ROWS = ["Account details", "Find specialists", "Notification settings", "Privacy & data sharing", "Help & support"];

export default function ProfileScreen({ navigation }: Props) {
  const you = familyMembers[0];
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
        <View style={styles.profileRow}>
          <Avatar initials={you.initials} color={you.color} size={56} />
          <View>
            <Text style={type.h2}>{you.name}</Text>
            <Text style={styles.sub}>Account owner</Text>
          </View>
        </View>

        <Card style={{ padding: 4 }}>
          {ROWS.map((r, i) => (
            <TouchableOpacity
              key={r}
              style={[styles.row, i < ROWS.length - 1 && styles.rowBorder]}
              onPress={r === "Find specialists" ? () => navigation.navigate("Specialists") : undefined}
            >
              <Text style={styles.rowLabel}>{r}</Text>
              <ChevronRightIcon />
            </TouchableOpacity>
          ))}
        </Card>

        <TouchableOpacity
          style={styles.manageFamilyBtn}
          onPress={() => navigation.navigate("FamilyMembers")}
        >
          <Text style={styles.manageFamilyText}>Manage family members</Text>
          <ChevronRightIcon color={colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.signOutBtn} onPress={() => navigation.getParent()?.navigate("Login")}>
          <Text style={styles.signOutText}>Sign out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  profileRow: { flexDirection: "row", gap: 14, alignItems: "center" },
  sub: { fontSize: 12.5, color: colors.textMuted, marginTop: 2 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 16 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  rowLabel: { fontSize: 14, color: colors.text, fontWeight: "500" },
  manageFamilyBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.primaryTint,
    borderRadius: 14,
    padding: 16,
  },
  manageFamilyText: { fontSize: 14, fontWeight: "700", color: colors.primary },
  signOutBtn: { alignItems: "center", paddingVertical: 14 },
  signOutText: { fontSize: 14, fontWeight: "600", color: colors.red },
});
