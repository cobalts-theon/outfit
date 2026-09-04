import { Image } from 'expo-image';
import type { StyleProp, TextStyle, ImageStyle } from 'react-native';
import { Text } from 'react-native';

import { useProfileAvatarUrl } from '@/features/auth/application/profile-query';

interface ProfileAvatarContentProps {
  readonly avatarPath: string | null | undefined;
  readonly fallback: string;
  readonly imageStyle: StyleProp<ImageStyle>;
  readonly textStyle: StyleProp<TextStyle>;
}

export function ProfileAvatarContent({
  avatarPath,
  fallback,
  imageStyle,
  textStyle,
}: ProfileAvatarContentProps) {
  const avatarUrlQuery = useProfileAvatarUrl(avatarPath);

  if (avatarUrlQuery.data !== undefined && avatarUrlQuery.data !== null) {
    return (
      <Image
        accessibilityElementsHidden
        cachePolicy="memory-disk"
        contentFit="cover"
        importantForAccessibility="no-hide-descendants"
        source={{ uri: avatarUrlQuery.data }}
        style={imageStyle}
        transition={150}
      />
    );
  }

  return <Text style={textStyle}>{fallback}</Text>;
}
