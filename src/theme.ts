export const colors = {
  bg: "#F6F7F9",
  surface: "#FFFFFF",
  border: "#ECEEF1",
  borderStrong: "#E4E7EC",
  text: "#1C2430",
  textMuted: "#6B7280",
  textFaint: "#9AA3AE",
  primary: "#4F46E5",
  primaryDark: "#3730A3",
  primaryTint: "#F3F0FF",
  indigo: "#4F46E5",
  indigoTint: "#F3F0FF",
  pink: "#BE185D",
  amber: "#B45309",
  amberTint: "#FDF1E3",
  amberText: "#8A4A08",
  red: "#B91C1C",
  redTint: "#FDECEC",
  redText: "#8A1515",
  green: "#15803D",
};

export const avatarColors = ["#0F766E", colors.indigo, colors.amber, colors.pink, "#0369A1"];

export const radius = { sm: 10, md: 12, lg: 16, xl: 20, pill: 999 };

export const spacing = (n: number) => n * 4;

export const shadow = {
  card: {
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  fab: {
    shadowColor: colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
};

export const type = {
  h1: { fontSize: 22, fontWeight: "800" as const },
  h2: { fontSize: 17, fontWeight: "700" as const },
  h3: { fontSize: 15, fontWeight: "700" as const },
  body: { fontSize: 14, fontWeight: "400" as const },
  bodyStrong: { fontSize: 14, fontWeight: "600" as const },
  small: { fontSize: 12.5, fontWeight: "400" as const },
  smallStrong: { fontSize: 12.5, fontWeight: "600" as const },
  tiny: { fontSize: 11, fontWeight: "600" as const },
};
