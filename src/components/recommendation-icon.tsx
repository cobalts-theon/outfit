/**
 * Icon của từng hành động khuyến nghị; ánh xạ actionKey sang hình và nhãn thay thế.
 */
import { View } from 'react-native';
import { Image } from 'expo-image';
// Ctrl/Cmd + click để mở file chỉnh giao diện.
import { recommendationActionIconStyles } from '@/css/components/recommendation-icon.styles';

// recommendation-action-icon

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
  shelter: require('../../assets/recommendation-icons/shelter.svg'),
  'air-quality': require('../../assets/recommendation-icons/air-quality.svg'),
  hanger: require('../../assets/weather-cloths/accessories-clothes-clothing-fashion-hangger-svgrepo-com.svg'),
  shirt: require('../../assets/weather-cloths/clothes-dress-fashion-man-shirt-svgrepo-com.svg'),
  't-shirt': require('../../assets/weather-cloths/cloth-clothes-clothing-neck-shirt-svgrepo-com.svg'),
  'winter-layer': require('../../assets/weather-cloths/clothes-fashion-shal-snowflake-winter-svgrepo-com.svg'),
  shoes: require('../../assets/weather-cloths/shoes-svgrepo-com.svg'),
  'temperature-high': require('../../assets/weather-cloths/temperature-high-svgrepo-com.svg'),
  'temperature-low': require('../../assets/weather-cloths/temperature-low-svgrepo-com.svg'),
  umbrella: require('../../assets/weather-cloths/umbrella-svgrepo-com.svg'),
};

export interface RecommendationIconPresentation {
  readonly iconKeys: readonly RecommendationIconKey[];
  readonly detailLabel: string;
}

const actionIconPresentations: Readonly<Record<string, RecommendationIconPresentation>> = {
  'morning-bag': { iconKeys: ['shirt'], detailLabel: 'CHUẨN BỊ BUỔI SÁNG' },
  'noon-break': { iconKeys: ['shelter'], detailLabel: 'NGHỈ TRƯA' },
  'afternoon-errands': { iconKeys: ['shoes'], detailLabel: 'VIỆC BUỔI CHIỀU' },
  'evening-prepare': { iconKeys: ['shirt'], detailLabel: 'CHUẨN BỊ NGÀY MAI' },
  'night-rest': { iconKeys: ['shelter'], detailLabel: 'NGHỈ NGƠI' },
  'weather-shelter': { iconKeys: ['shelter'], detailLabel: 'NƠI TRÚ AN TOÀN' },
  'air-quality-exposure': { iconKeys: ['air-quality'], detailLabel: 'GIẢM PHƠI NHIỄM' },
  'rain-protection': { iconKeys: ['umbrella', 'shoes'], detailLabel: 'Ô · GIÀY BÁM TỐT' },
  'dry-laundry': { iconKeys: ['hanger'], detailLabel: 'GIẶT PHƠI KHI CẦN' },
  'protect-laundry': { iconKeys: ['hanger', 'umbrella'], detailLabel: 'MÓC ÁO · CHỖ CÓ MÁI' },
  'sun-heat-protection': { iconKeys: ['temperature-high'], detailLabel: 'CHỐNG NẮNG · GIẢM NÓNG' },
  'sun-protection': { iconKeys: ['temperature-high'], detailLabel: 'CHE NẮNG · GIẢM PHƠI NẮNG' },
  'heat-hydration': { iconKeys: ['temperature-high'], detailLabel: 'BÙ NƯỚC · GIẢM NÓNG' },
  'indoor-comfort': { iconKeys: ['shelter'], detailLabel: 'CHỖ NGỒI · CHỖ NGHỈ' },
  'damp-care': { iconKeys: ['umbrella'], detailLabel: 'ĐỒ ƯỚT · CHỖ NGHỈ' },
  'dry-air-care': { iconKeys: ['shelter'], detailLabel: 'KHÔNG KHÍ KHÔ' },
  'light-clothing': { iconKeys: ['t-shirt', 'shirt'], detailLabel: 'ÁO NHẸ · DỄ ĐIỀU CHỈNH' },
  'warm-clothing': { iconKeys: ['temperature-low', 'winter-layer'], detailLabel: 'LỚP GIỮ ẤM · CHE CHẮN' },
  'outdoor-adjustment': { iconKeys: ['shoes'], detailLabel: 'ĐIỀU CHỈNH VẬN ĐỘNG' },
  'outdoor-activity-window': { iconKeys: ['shoes'], detailLabel: 'ĐI BỘ · VẬN ĐỘNG NHẸ' },
};

const fallbackPresentation: RecommendationIconPresentation = {
  iconKeys: ['shoes'],
  detailLabel: 'HÀNH ĐỘNG NGOÀI TRỜI',
};

// Chọn icon và nhãn cho hành động.
export function resolveRecommendationIconPresentation(actionKey: string): RecommendationIconPresentation {
  return actionIconPresentations[actionKey] ?? fallbackPresentation;
}

interface RecommendationActionIconProps {
  readonly actionKey: string;
  readonly primary?: boolean;
  readonly compact?: boolean;
}

// Hiển thị icon của lời khuyên.
export function RecommendationActionIcon({ actionKey, primary = false, compact = false }: RecommendationActionIconProps) {
  const presentation = resolveRecommendationIconPresentation(actionKey);

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={recommendationActionIconStyles.group}
    >
      {(compact ? presentation.iconKeys.slice(0, 1) : presentation.iconKeys).map(
        (iconKey, index) => (
          <View
            key={iconKey}
            style={[
              recommendationActionIconStyles.frame,
              compact && recommendationActionIconStyles.compactFrame,
              primary && index === 0 ? recommendationActionIconStyles.framePrimary : null,
            ]}
          >
            <Image
              contentFit="contain"
              source={recommendationIconAssets[iconKey]}
              style={[recommendationActionIconStyles.image, compact && recommendationActionIconStyles.compactImage]}
            />
          </View>
        ),
      )}
    </View>
  );
}
