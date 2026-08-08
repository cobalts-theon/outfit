import { describe, expect, it } from '@jest/globals';

import { spacing, touchTargets } from '@/theme/tokens';

describe('foundation design tokens', () => {
  it('keeps the spacing scale strictly increasing', () => {
    const values = Object.values(spacing);

    expect(values.every((value, index) => index === 0 || value > values[index - 1])).toBe(true);
  });

  it('preserves native minimum touch targets', () => {
    expect(touchTargets.ios).toBeGreaterThanOrEqual(44);
    expect(touchTargets.android).toBeGreaterThanOrEqual(48);
  });
});
