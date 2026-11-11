import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { RootStackParamList } from "./types";
import LoginScreen from "../screens/LoginScreen";
import MainTabs from "./MainTabs";
import MemberProfileScreen from "../screens/MemberProfileScreen";
import FamilyMembersScreen from "../screens/FamilyMembersScreen";
import CapturePrescriptionScreen from "../screens/CapturePrescriptionScreen";
import PrescriptionDetailScreen from "../screens/PrescriptionDetailScreen";
import MedicineDetailScreen from "../screens/MedicineDetailScreen";
import AddEditRecordScreen from "../screens/AddEditRecordScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="MemberProfile" component={MemberProfileScreen} />
      <Stack.Screen name="FamilyMembers" component={FamilyMembersScreen} />
      <Stack.Screen name="CapturePrescription" component={CapturePrescriptionScreen} options={{ presentation: "fullScreenModal" }} />
      <Stack.Screen name="PrescriptionDetail" component={PrescriptionDetailScreen} />
      <Stack.Screen name="MedicineDetail" component={MedicineDetailScreen} />
      <Stack.Screen name="AddEditRecord" component={AddEditRecordScreen} options={{ presentation: "formSheet" }} />
    </Stack.Navigator>
  );
}
