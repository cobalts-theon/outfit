export type RecommendationIconKey =
  | 'shelter'
  | 'air-quality'
  | 'hanger'
  | 'shirt'
  | 't-shirt'
  | 'winter-layer'
  | 'shoes'
  | 'temperature-high'
  | 'temperature-low'
  | 'umbrella';

export const recommendationIconAssets: Readonly<Record<RecommendationIconKey, number>> = {
  shelter: require('../../../../assets/recommendation-icons/shelter.svg'),
  'air-quality': require('../../../../assets/recommendation-icons/air-quality.svg'),
  hanger: require('../../../../assets/weather-cloths/accessories-clothes-clothing-fashion-hangger-svgrepo-com.svg'),
  shirt: require('../../../../assets/weather-cloths/clothes-dress-fashion-man-shirt-svgrepo-com.svg'),
  't-shirt': require('../../../../assets/weather-cloths/cloth-clothes-clothing-neck-shirt-svgrepo-com.svg'),
  'winter-layer': require('../../../../assets/weather-cloths/clothes-fashion-shal-snowflake-winter-svgrepo-com.svg'),
  shoes: require('../../../../assets/weather-cloths/shoes-svgrepo-com.svg'),
  'temperature-high': require('../../../../assets/weather-cloths/temperature-high-svgrepo-com.svg'),
  'temperature-low': require('../../../../assets/weather-cloths/temperature-low-svgrepo-com.svg'),
  umbrella: require('../../../../assets/weather-cloths/umbrella-svgrepo-com.svg'),
};

export interface RecommendationIconPresentation {
  readonly iconKeys: readonly RecommendationIconKey[];
  readonly detailLabel: string;
}

const actionIconPresentations: Readonly<Record<string, RecommendationIconPresentation>> = {
  'weather-shelter': { iconKeys: ['shelter'], detailLabel: 'NƠI TRÚ AN TOÀN' },
  'air-quality-exposure': {
    iconKeys: ['air-quality'],
    detailLabel: 'GIẢM PHƠI NHIỄM',
  },
  'rain-protection': {
    iconKeys: ['umbrella', 'shoes'],
    detailLabel: 'Ô · GIÀY BÁM TỐT',
  },
  'protect-laundry': {
    iconKeys: ['hanger', 'umbrella'],
    detailLabel: 'MÓC ÁO · CHỖ CÓ MÁI',
  },
  'sun-heat-protection': {
    iconKeys: ['temperature-high'],
    detailLabel: 'CHỐNG NẮNG · GIẢM NÓNG',
  },
  'sun-protection': {
    iconKeys: ['temperature-high'],
    detailLabel: 'CHE NẮNG · GIẢM PHƠI NẮNG',
  },
  'heat-hydration': {
    iconKeys: ['temperature-high'],
    detailLabel: 'BÙ NƯỚC · GIẢM NÓNG',
  },
  'light-clothing': {
    iconKeys: ['t-shirt', 'shirt'],
    detailLabel: 'ÁO NHẸ · DỄ ĐIỀU CHỈNH',
  },
  'warm-clothing': {
    iconKeys: ['temperature-low', 'winter-layer'],
    detailLabel: 'LỚP GIỮ ẤM · CHE CHẮN',
  },
  'outdoor-activity-window': {
    iconKeys: ['shoes'],
    detailLabel: 'ĐI BỘ · VẬN ĐỘNG NHẸ',
  },
};

const fallbackPresentation: RecommendationIconPresentation = {
  iconKeys: ['shoes'],
  detailLabel: 'HÀNH ĐỘNG NGOÀI TRỜI',
};

export function resolveRecommendationIconPresentation(
  actionKey: string,
): RecommendationIconPresentation {
  return actionIconPresentations[actionKey] ?? fallbackPresentation;
}
