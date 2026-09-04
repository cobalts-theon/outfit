import { Image } from 'expo-image';
import { Platform, StyleSheet, Text, View } from 'react-native';

import { NeoButton } from '@/components/ui/neo-button';
import { NeoSheet } from '@/components/ui/neo-sheet';
import { useNotifications } from '@/features/notifications/application/notification-provider';
import { appThemes, homeVisualTokens, spacing, typography } from '@/theme/tokens';

interface NotificationSettingsSheetProps {
  readonly visible: boolean;
  readonly onClose: () => void;
}

const notificationIcon = require('../../../../assets/recommendation-icons/notification.svg');

const notificationTopics = [
  'Mưa đang xảy ra hoặc có khả năng cao trong ba giờ tới',
  'Nhắc thu quần áo, đồ vải và chuẩn bị ô hoặc áo mưa',
  'Hành động ưu tiên khi UV, AQI, nhiệt độ hoặc thời tiết cần lưu ý',
] as const;

export function NotificationSettingsSheet({
  visible,
  onClose,
}: NotificationSettingsSheetProps) {
  const { state, enable, disable, openSettings, sendTest } = useNotifications();
  const enabled = state.status === 'enabled';
  const busy = state.status === 'loading' || state.status === 'enabling';

  return (
    <NeoSheet label="ALERTS//DEVICE" onClose={onClose} title="THÔNG BÁO" visible={visible}>
      <View style={styles.statusPanel}>
        <Image
          accessibilityElementsHidden
          contentFit="contain"
          importantForAccessibility="no-hide-descendants"
          source={notificationIcon}
          style={styles.icon}
        />
        <View style={styles.statusCopy}>
          <Text style={styles.statusLabel}>CẢNH BÁO TRÊN THIẾT BỊ</Text>
          <Text accessibilityRole="header" style={styles.statusTitle}>
            {enabled ? 'ĐANG BẬT' : state.status === 'denied' ? 'BỊ CHẶN' : 'ĐANG TẮT'}
          </Text>
          <Text style={styles.statusDetail}>
            {enabled
              ? 'Chỉ lập lịch khi dữ liệu mới tạo ra một hành động đáng chú ý; mỗi tình huống được nhận diện để không gửi lại sau mỗi lần tải dữ liệu.'
              : 'Ứng dụng không xin quyền khi khởi động. Chỉ khi bạn chủ động bật, hệ thống mới hiển thị hộp thoại cấp quyền.'}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>SẼ NHẮC KHI</Text>
        {notificationTopics.map((topic) => (
          <View key={topic} style={styles.topicRow}>
            <View accessibilityElementsHidden style={styles.checkMark} />
            <Text style={styles.topicText}>{topic}</Text>
          </View>
        ))}
      </View>

      <View style={styles.scopeNote}>
        <Text style={styles.scopeTitle}>PHẠM VI BẢN HIỆN TẠI</Text>
        <Text style={styles.scopeCopy}>
          Cảnh báo được lập lịch ngay trên thiết bị sau khi ứng dụng tải dự báo. Push từ máy chủ khi ứng dụng chưa từng tải dữ liệu cần development build và hạ tầng gửi riêng.
        </Text>
        {enabled ? (
          <Text style={styles.scopeState}>
            {state.remotePush === 'ready'
              ? 'TOKEN PUSH · CLIENT SẴN SÀNG · CHƯA KẾT NỐI MÁY CHỦ'
              : 'THÔNG BÁO CỤC BỘ · ĐANG HOẠT ĐỘNG'}
          </Text>
        ) : null}
      </View>

      {state.feedback === undefined ? null : (
        <Text accessibilityLiveRegion="polite" style={styles.feedback}>
          {state.feedback}
        </Text>
      )}

      <View style={styles.actions}>
        {state.status === 'denied' ? (
          <NeoButton label="MỞ CÀI ĐẶT HỆ THỐNG" onPress={() => void openSettings()} />
        ) : enabled ? (
          <>
            <NeoButton label="GỬI THÔNG BÁO THỬ" onPress={() => void sendTest()} />
            <NeoButton label="TẮT CẢNH BÁO" onPress={() => void disable()} tone="secondary" />
          </>
        ) : (
          <NeoButton
            disabled={busy}
            label={busy ? 'ĐANG CHUẨN BỊ…' : 'BẬT CẢNH BÁO'}
            onPress={() => void enable()}
          />
        )}
      </View>

      <Text style={styles.platformNote}>
        {Platform.OS === 'android'
          ? 'Android có thể tiếp tục giới hạn âm thanh hoặc thông báo theo chế độ pin và kênh hệ thống.'
          : 'iOS có thể áp dụng chế độ Tập trung hoặc phân phối yên lặng theo cài đặt hệ thống.'}
      </Text>
    </NeoSheet>
  );
}

const colors = appThemes.light.colors;

const styles = StyleSheet.create({
  statusPanel: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    borderWidth: 3,
    borderColor: colors.border,
    padding: spacing.md,
    backgroundColor: homeVisualTokens.mint,
    boxShadow: '6px 6px 0px #101010',
  },
  icon: {
    width: 64,
    height: 64,
    flexShrink: 0,
  },
  statusCopy: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xxs,
  },
  statusLabel: {
    color: colors.text,
    fontFamily: typography.identitySemibold,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.6,
  },
  statusTitle: {
    color: colors.text,
    fontFamily: typography.heading,
    fontSize: 27,
    lineHeight: 31,
  },
  statusDetail: {
    color: colors.text,
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 20,
  },
  section: {
    borderTopWidth: 3,
    borderColor: colors.border,
  },
  sectionTitle: {
    paddingVertical: spacing.sm,
    color: colors.text,
    fontFamily: typography.heading,
    fontSize: 18,
    lineHeight: 22,
  },
  topicRow: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderTopWidth: 2,
    borderColor: colors.border,
    paddingVertical: spacing.sm,
  },
  checkMark: {
    width: 16,
    height: 16,
    flexShrink: 0,
    borderWidth: 3,
    borderColor: colors.border,
    backgroundColor: homeVisualTokens.cobalt,
  },
  topicText: {
    flex: 1,
    minWidth: 0,
    color: colors.text,
    fontFamily: typography.body,
    fontSize: 14,
    lineHeight: 21,
  },
  scopeNote: {
    gap: spacing.xs,
    borderWidth: 3,
    borderColor: colors.border,
    padding: spacing.md,
    backgroundColor: homeVisualTokens.paleBlueField,
  },
  scopeTitle: {
    color: colors.text,
    fontFamily: typography.heading,
    fontSize: 16,
    lineHeight: 20,
  },
  scopeCopy: {
    color: colors.text,
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 20,
  },
  scopeState: {
    color: homeVisualTokens.cobalt,
    fontFamily: typography.identitySemibold,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.4,
  },
  feedback: {
    borderWidth: 2,
    borderColor: colors.border,
    padding: spacing.sm,
    color: colors.text,
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 20,
    backgroundColor: homeVisualTokens.sunflower,
  },
  actions: {
    gap: spacing.sm,
  },
  platformNote: {
    color: colors.textMuted,
    fontFamily: typography.body,
    fontSize: 11,
    lineHeight: 17,
  },
});
