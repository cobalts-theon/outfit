import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import {
  recommendationIconAssets,
  resolveRecommendationIconPresentation,
} from '@/features/recommendations/presentation/recommendation-icon-assets';
import { appThemes, homeVisualTokens } from '@/theme/tokens';

interface RecommendationActionIconProps {
  readonly actionKey: string;
  readonly primary?: boolean;
}

export function RecommendationActionIcon({
  actionKey,
  primary = false,
}: RecommendationActionIconProps) {
  const presentation = resolveRecommendationIconPresentation(actionKey);

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={styles.group}
    >
      {presentation.iconKeys.map((iconKey, index) => (
        <View
          key={iconKey}
          style={[styles.frame, primary && index === 0 ? styles.framePrimary : null]}
        >
          <Image
            contentFit="contain"
            source={recommendationIconAssets[iconKey]}
            style={styles.image}
          />
        </View>
      ))}
    </View>
  );
}

const colors = appThemes.light.colors;

const styles = StyleSheet.create({
  group: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
  },
  frame: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    borderWidth: 3,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  framePrimary: {
    backgroundColor: homeVisualTokens.sunflower,
  },
  image: {
    width: 36,
    height: 36,
  },
});
