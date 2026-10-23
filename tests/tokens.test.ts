import { describe, expect, it } from '@jest/globals';
import { radii, spacing, touchTargets, typography, homeVisualTokens, appThemes } from '@/theme';

describe('foundation design tokens', () => {
  it('keeps the spacing scale strictly increasing', () => {
    const values = Object.values(spacing);

    expect(values.every((value, index) => index === 0 || value > values[index - 1])).toBe(true);
  });

  it('preserves native minimum touch targets', () => {
    expect(touchTargets.ios).toBeGreaterThanOrEqual(44);
    expect(touchTargets.android).toBeGreaterThanOrEqual(48);
  });

  it('uses consistent 12px corners', () => {
    expect(Object.values(radii).every((radius) => radius === 12)).toBe(true);
  });

  it('uses JetBrains Mono for normal copy and dedicated poster faces for hierarchy', () => {
    expect(typography.body).toBe('JetBrainsMono');
    expect(typography.identity).toBe('JetBrainsMono');
    expect(typography.heading).toBe('ArchivoBlack');
    expect(typography.temperature).toBe('BebasNeue');
  });
});

function luminance(hex: string) {
  const channels = hex
    .slice(1)
    .match(/../g)!
    .map((value) => {
      const channel = parseInt(value, 16) / 255;
      return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
    });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

it.each([
  'infoSurface',
  'selectionSurface',
  'calmSurface',
  'attentionSurface',
  'warningSurface',
  'dangerSurface',
] as const)('keeps dark body text readable on %s', (role) => {
  const background = luminance(homeVisualTokens[role]);
  const foreground = luminance(homeVisualTokens.ink);
  expect((background + 0.05) / (foreground + 0.05)).toBeGreaterThanOrEqual(4.5);
});

it('keeps button copy readable with separate secondary fill and border', () => {
  const colors = appThemes.light.colors;
  expect(
    (luminance(colors.secondary) + 0.05) / (luminance(colors.border) + 0.05),
  ).toBeGreaterThanOrEqual(3);
  expect(
    (luminance(colors.secondary) + 0.05) / (luminance(colors.onSecondary) + 0.05),
  ).toBeGreaterThanOrEqual(4.5);
  expect(
    (luminance(colors.primary) + 0.05) / (luminance(colors.onPrimary) + 0.05),
  ).toBeGreaterThanOrEqual(4.5);
});
