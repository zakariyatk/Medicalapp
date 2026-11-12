/** Dark theme: near-black background, slightly lifted surfaces, light text. */
export const colors = {
  bg: "#0B0B0D",
  surface: "#17171B",
  border: "#25252B",
  borderStrong: "#32323A",
  text: "#F3F3F6",
  textMuted: "#A3A3AE",
  textFaint: "#70707B",
  primary: "#14B8A6",
  primaryDark: "#0F766E",
  primaryTint: "#0F2C29",
  indigo: "#8B93F8",
  indigoTint: "#1D1B36",
  pink: "#F472B6",
  amber: "#F59E0B",
  amberTint: "#2B2010",
  amberText: "#FBBF24",
  red: "#F87171",
  redTint: "#2C1515",
  redText: "#FCA5A5",
  green: "#4ADE80",
};

/** Warm accent used by Health Screening entry points. */
export const warm = { bg: "#2A1C12", text: "#FCE3CF", sub: "#F5B98A", dot: "#F59E5B" };

export const avatarColors = [colors.primary, colors.indigo, colors.amber, colors.pink, "#0369A1"];

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
  h1: { fontSize: 22, fontWeight: "800" as const, color: colors.text },
  h2: { fontSize: 17, fontWeight: "700" as const, color: colors.text },
  h3: { fontSize: 15, fontWeight: "700" as const, color: colors.text },
  body: { fontSize: 14, fontWeight: "400" as const, color: colors.text },
  bodyStrong: { fontSize: 14, fontWeight: "600" as const, color: colors.text },
  small: { fontSize: 12.5, fontWeight: "400" as const, color: colors.text },
  smallStrong: { fontSize: 12.5, fontWeight: "600" as const, color: colors.text },
  tiny: { fontSize: 11, fontWeight: "600" as const, color: colors.text },
};
