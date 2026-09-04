import { describe, expect, it } from '@jest/globals';

import { resolveRecommendationIconPresentation } from '@/features/recommendations/presentation/recommendation-icon-assets';

describe('recommendation icon presentation', () => {
  it('builds a concrete rain kit from the supplied clothing assets', () => {
    expect(resolveRecommendationIconPresentation('rain-protection')).toEqual({
      iconKeys: ['umbrella', 'shoes'],
      detailLabel: 'Ô · GIÀY BÁM TỐT',
    });
  });

  it('distinguishes light and warm clothing kits', () => {
    expect(resolveRecommendationIconPresentation('light-clothing').iconKeys).toEqual([
      't-shirt',
      'shirt',
    ]);
    expect(resolveRecommendationIconPresentation('warm-clothing').iconKeys).toEqual([
      'temperature-low',
      'winter-layer',
    ]);
  });

  it.each([
    ['sun-heat-protection', 'CHỐNG NẮNG · GIẢM NÓNG'],
    ['sun-protection', 'CHE NẮNG · GIẢM PHƠI NẮNG'],
    ['heat-hydration', 'BÙ NƯỚC · GIẢM NÓNG'],
  ])('does not show clothing for the %s action', (actionKey, detailLabel) => {
    expect(resolveRecommendationIconPresentation(actionKey)).toEqual({
      iconKeys: ['temperature-high'],
      detailLabel,
    });
  });

  it('uses a stable outdoor fallback for future action keys', () => {
    expect(resolveRecommendationIconPresentation('future-action')).toEqual({
      iconKeys: ['shoes'],
      detailLabel: 'HÀNH ĐỘNG NGOÀI TRỜI',
    });
  });
});
