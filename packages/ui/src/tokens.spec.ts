import { describe, expect, it } from 'vitest';
import { SEMANTIC_DESIGN_TOKENS, type ThemeTokenValues, generateCssVariables } from './tokens';

describe('Design Tokens Engine', () => {
  it('should define the mandatory UI/UX Pro Max semantic tokens', () => {
    expect(SEMANTIC_DESIGN_TOKENS).toContain('--bg-canvas');
    expect(SEMANTIC_DESIGN_TOKENS).toContain('--bg-surface');
    expect(SEMANTIC_DESIGN_TOKENS).toContain('--text-main');
    expect(SEMANTIC_DESIGN_TOKENS).toContain('--text-muted');
    expect(SEMANTIC_DESIGN_TOKENS).toContain('--border-base');
    expect(SEMANTIC_DESIGN_TOKENS).toContain('--accent-primary');
  });

  it('should generate valid CSS variables object from theme values', () => {
    const theme: ThemeTokenValues = {
      bgCanvas: '#09090b',
      bgSurface: '#18181b',
      textMain: '#fafafa',
      textMuted: '#a1a1aa',
      borderBase: '#27272a',
      accentPrimary: '#3b82f6',
    };

    const vars = generateCssVariables(theme);

    expect(vars).toEqual({
      '--bg-canvas': '#09090b',
      '--bg-surface': '#18181b',
      '--text-main': '#fafafa',
      '--text-muted': '#a1a1aa',
      '--border-base': '#27272a',
      '--accent-primary': '#3b82f6',
    });
  });
});
