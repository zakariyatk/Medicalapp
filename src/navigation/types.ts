export type RootStackParamList = {
  Login: undefined;
  MainTabs: undefined;
  MemberProfile: { memberId: string };
  CapturePrescription: undefined;
  PrescriptionDetail: { prescriptionId: string };
  MedicineDetail: { medicineId: string; prescriptionId?: string; memberId?: string };
  AddEditRecord: { memberId?: string; recordId?: string; recordType?: "Prescription" | "Lab report" | "Vaccination" };
  FamilyMembers: undefined;
  Specialists: undefined;
};

export type MainTabsParamList = {
  Dashboard: undefined;
  Family: undefined;
  Records: undefined;
  Profile: undefined;
};
