import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { createBottomTabNavigator, BottomTabBarProps } from "@react-navigation/bottom-tabs";
import type { MainTabsParamList } from "./types";
import DashboardScreen from "../screens/DashboardScreen";
import FamilyMembersScreen from "../screens/FamilyMembersScreen";
import RecordsScreen from "../screens/RecordsScreen";
import ProfileScreen from "../screens/ProfileScreen";
import { HomeIcon, UsersIcon, RecordsIcon, ProfileIcon, CameraIcon } from "../components/icons";
import { colors, shadow } from "../theme";

const Tab = createBottomTabNavigator<MainTabsParamList>();

function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const icons: Record<string, (color: string) => React.ReactNode> = {
    Dashboard: (c) => <HomeIcon color={c} />,
    Family: (c) => <UsersIcon color={c} />,
    Records: (c) => <RecordsIcon color={c} />,
    Profile: (c) => <ProfileIcon color={c} />,
  };
  const labels: Record<string, string> = { Dashboard: "Home", Family: "Family", Records: "Records", Profile: "Profile" };
  const leftRoutes = state.routes.slice(0, 2);
  const rightRoutes = state.routes.slice(2);

  const renderTab = (route: (typeof state.routes)[number], index: number) => {
    const isFocused = state.index === index;
    const color = isFocused ? colors.text : colors.textFaint;
    return (
      <TouchableOpacity
        key={route.key}
        style={styles.tabItem}
        accessibilityRole="button"
        accessibilityLabel={labels[route.name]}
        onPress={() => navigation.navigate(route.name)}
      >
        {icons[route.name](color)}
        <Text style={[styles.tabLabel, { color }]}>{labels[route.name]}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.bar}>
      {leftRoutes.map((r, i) => renderTab(r, i))}
      <TouchableOpacity
        accessibilityLabel="Scan a new prescription"
        style={styles.fab}
        onPress={() => navigation.getParent()?.navigate("CapturePrescription")}
      >
        <CameraIcon color={colors.bg} />
      </TouchableOpacity>
      {rightRoutes.map((r, i) => renderTab(r, i + 2))}
    </View>
  );
}

export default function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
      backBehavior="none"
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Family" component={FamilyMembersScreen} />
      <Tab.Screen name="Records" component={RecordsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 14,
  },
  tabItem: { alignItems: "center", gap: 4, flex: 1 },
  tabLabel: { fontSize: 11, fontWeight: "600" },
  fab: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.text,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -26,
    ...shadow.fab,
    shadowColor: "#000",
  },
});
