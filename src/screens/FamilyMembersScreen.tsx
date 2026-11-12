import React, { useState } from "react";
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TextInput, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { Card, PrimaryButton, ScreenHeader } from "../components/ui";
import { MemberAvatar } from "../components/PersonIllustrations";
import { PlusIcon } from "../components/icons";
import { colors, type } from "../theme";
import { familyMembers } from "../data/mockData";

const accessLabel: Record<string, { label: string; bg: string; color: string }> = {
  owner: { label: "Full access", bg: colors.primaryTint, color: colors.primary },
  full: { label: "Full access · Logged in", bg: colors.primaryTint, color: colors.primary },
  child: { label: "Child profile · Managed by you", bg: colors.indigoTint, color: colors.indigo },
  pending: { label: "Invitation pending", bg: colors.amberTint, color: colors.amber },
};

export default function FamilyMembersScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [showInvite, setShowInvite] = useState(false);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenHeader title="Family members" onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined} />
      <Text style={styles.subtitle}>Everyone with access to your family’s medical records</Text>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 10 }}>
        {familyMembers.map((m) => {
          const access = accessLabel[m.access];
          return (
            <Card key={m.id} style={styles.memberCard}>
              <MemberAvatar member={m} size={46} />
              <View style={{ flex: 1 }}>
                <Text style={type.bodyStrong}>
                  {m.name} {m.access === "owner" ? <Text style={{ color: colors.primary, fontSize: 11 }}>(You)</Text> : null}
                </Text>
                <Text style={styles.memberSub}>
                  {m.relation} · DOB {m.dob}
                </Text>
                <View style={styles.memberFooter}>
                  <View style={[styles.tag, { backgroundColor: access.bg }]}>
                    <Text style={[styles.tagText, { color: access.color }]}>{access.label}</Text>
                  </View>
                  {m.access !== "owner" ? (
                    <TouchableOpacity>
                      <Text style={styles.manageLink}>{m.access === "pending" ? "Resend" : "Manage"}</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>
            </Card>
          );
        })}

        <TouchableOpacity style={styles.inviteBtn} onPress={() => setShowInvite((v) => !v)}>
          <PlusIcon />
          <Text style={styles.inviteBtnLabel}>Invite a family member</Text>
        </TouchableOpacity>

        {showInvite ? (
          <Card style={styles.inviteForm}>
            <Text style={type.h3}>New invitation</Text>
            <View>
              <Text style={styles.label}>Full name</Text>
              <TextInput style={styles.input} placeholder="e.g. Devki Sakariya" placeholderTextColor={colors.textFaint} />
            </View>
            <View>
              <Text style={styles.label}>Mobile number or email</Text>
              <TextInput style={styles.input} placeholder="For their own login" placeholderTextColor={colors.textFaint} />
            </View>
            <View>
              <Text style={styles.label}>Relationship</Text>
              <TextInput style={styles.input} placeholder="e.g. Mother" placeholderTextColor={colors.textFaint} />
            </View>
            <View>
              <Text style={styles.label}>Access level</Text>
              <TextInput style={styles.input} placeholder="Full access / View only / Child profile" placeholderTextColor={colors.textFaint} />
            </View>
            <PrimaryButton label="Send invite" onPress={() => setShowInvite(false)} />
          </Card>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  subtitle: { fontSize: 13, color: colors.textMuted, paddingHorizontal: 20, marginTop: 2 },
  memberCard: { flexDirection: "row", gap: 12, padding: 14, alignItems: "flex-start" },
  memberSub: { fontSize: 12, color: colors.textMuted, marginTop: 2, marginBottom: 8 },
  memberFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  tag: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 999 },
  tagText: { fontSize: 11, fontWeight: "600" },
  manageLink: { fontSize: 12, fontWeight: "600", color: colors.textMuted },
  inviteBtn: {
    height: 50,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  inviteBtnLabel: { color: colors.primary, fontWeight: "700", fontSize: 14 },
  inviteForm: { padding: 18, gap: 12 },
  label: { fontSize: 12, fontWeight: "600", marginBottom: 5, color: colors.text },
  input: {
    height: 46,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    paddingHorizontal: 14,
    fontSize: 14,
    color: colors.text,
  },
});
