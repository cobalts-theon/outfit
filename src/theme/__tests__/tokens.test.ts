import { describe, expect, it } from '@jest/globals';

import { radii, spacing, touchTargets, typography } from '@/theme/tokens';

describe('foundation design tokens', () => {
  it('keeps the spacing scale strictly increasing', () => {
    const values = Object.values(spacing);

    expect(values.every((value, index) => index === 0 || value > values[index - 1])).toBe(true);
  });

  it('preserves native minimum touch targets', () => {
    expect(touchTargets.ios).toBeGreaterThanOrEqual(44);
    expect(touchTargets.android).toBeGreaterThanOrEqual(48);
  });

  it('keeps the neo-brutalist surface vocabulary square', () => {
    expect(Object.values(radii).every((radius) => radius === 0)).toBe(true);
  });

  it('uses JetBrains Mono for normal copy and dedicated poster faces for hierarchy', () => {
    expect(typography.body).toBe('JetBrainsMono');
    expect(typography.identity).toBe('JetBrainsMono');
    expect(typography.heading).toBe('ArchivoBlack');
    expect(typography.temperature).toBe('BebasNeue');
  });
});
