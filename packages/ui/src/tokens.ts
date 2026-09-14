export const SEMANTIC_DESIGN_TOKENS = [
  '--bg-canvas',
  '--bg-surface',
  '--text-main',
  '--text-muted',
  '--border-base',
  '--accent-primary',
] as const;

export type SemanticDesignToken = (typeof SEMANTIC_DESIGN_TOKENS)[number];

export interface ThemeTokenValues {
  bgCanvas: string;
  bgSurface: string;
  textMain: string;
  textMuted: string;
  borderBase: string;
  accentPrimary: string;
}

export function generateCssVariables(tokens: ThemeTokenValues): Record<string, string> {
  return {
    '--bg-canvas': tokens.bgCanvas,
    '--bg-surface': tokens.bgSurface,
    '--text-main': tokens.textMain,
    '--text-muted': tokens.textMuted,
    '--border-base': tokens.borderBase,
    '--accent-primary': tokens.accentPrimary,
  };
}
