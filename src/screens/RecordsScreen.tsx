import React from "react";
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from "react-native";
import type { CompositeScreenProps } from "@react-navigation/native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { MainTabsParamList, RootStackParamList } from "../navigation/types";
import { Card } from "../components/ui";
import { MemberAvatar } from "../components/PersonIllustrations";
import { ChevronRightIcon } from "../components/icons";
import { colors, type } from "../theme";
import { familyMembers, prescriptions } from "../data/mockData";

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabsParamList, "Records">,
  NativeStackScreenProps<RootStackParamList>
>;

export default function RecordsScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={styles.header}>
        <Text style={type.h1}>All records</Text>
        <Text style={styles.subtitle}>Every family member’s medical history, in one place</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 12 }}>
        {familyMembers.map((m) => {
          const count = prescriptions.filter((rx) => rx.memberId === m.id).length;
          return (
            <TouchableOpacity key={m.id} onPress={() => navigation.navigate("MemberProfile", { memberId: m.id })}>
              <Card style={styles.row}>
                <MemberAvatar member={m} size={46} />
                <View style={{ flex: 1 }}>
                  <Text style={type.bodyStrong}>{m.name}</Text>
                  <Text style={styles.sub}>
                    {count} prescription{count === 1 ? "" : "s"} on file
                  </Text>
                </View>
                <ChevronRightIcon />
              </Card>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { padding: 20, paddingBottom: 4 },
  subtitle: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  row: { flexDirection: "row", gap: 12, alignItems: "center", padding: 14 },
  sub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
});
