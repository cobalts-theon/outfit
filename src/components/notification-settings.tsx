/**
 * Giao diện bật/tắt thông báo, kiểm tra quyền và gửi thông báo thử.
 * Hiển thị khả năng thông báo phù hợp với môi trường đang chạy.
 */
import { Image } from 'expo-image';
import Constants from 'expo-constants';
import { Platform, Text, View } from 'react-native';
import { NeoButton, NeoSheet } from '@/components/controls';
import { useNotifications } from '@/context/notifications';
// Ctrl/Cmd + click để mở file chỉnh giao diện.
import { styles } from '@/css/components/notification-settings.styles';

// notification-settings-sheet

interface NotificationSettingsSheetProps {
  readonly visible: boolean;
  readonly onClose: () => void;
}

const notificationIcon = require('../../assets/recommendation-icons/notification.svg');

const notificationTopics = [
  'Mưa đang xảy ra hoặc có khả năng cao trong ba giờ tới',
  'Chuẩn bị áo mưa và sắp xếp việc di chuyển',
  'Hành động ưu tiên khi UV, AQI, nhiệt độ hoặc thời tiết cần lưu ý',
] as const;

// Hiển thị tùy chọn và quyền thông báo.
export function NotificationSettingsSheet({ visible, onClose }: NotificationSettingsSheetProps) {
  const { state, enable, disable, openSettings, sendTest } = useNotifications();
  const enabled = state.status === 'enabled';
  const busy = state.status === 'loading' || state.status === 'enabling';

  return (
    <NeoSheet label="NHẮC NHỞ" onClose={onClose} title="THÔNG BÁO" visible={visible}>
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
              ? 'Nhắc khi thời tiết cần chú ý, hạn chế lặp lại cùng một tình huống.'
              : 'Bật để nhận nhắc nhở. Bạn có thể tắt bất cứ lúc nào.'}
          </Text>
        </View>
      </View>

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

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>SẼ NHẮC KHI</Text>
        {notificationTopics.map((topic) => (
          <View key={topic} style={styles.topicRow}>
            <View accessibilityElementsHidden style={styles.checkMark} />
            <Text style={styles.topicText}>{topic}</Text>
          </View>
        ))}
      </View>

      {Constants.appOwnership === 'expo' ? (
        <Text style={styles.feedback}>
          Đang dùng Expo Go: thông báo sẽ hiện trong thanh thông báo của điện thoại, có thể mang tên
          Expo Go.
        </Text>
      ) : null}
      <NeoButton
        tone="neutral"
        label="KIỂM TRA CÀI ĐẶT THÔNG BÁO"
        onPress={() => void openSettings()}
      />
      <View style={styles.scopeNote}>
        <Text style={styles.scopeTitle}>DỮ LIỆU DÙNG ĐỂ NHẮC</Text>
        <Text style={styles.scopeCopy}>
          Thông báo dựa trên dự báo đã tải. Mở ứng dụng để cập nhật; ứng dụng chưa theo dõi thời
          tiết liên tục khi đóng.
        </Text>
        {enabled ? (
          <Text style={styles.scopeState}>
            {state.remotePush === 'ready'
              ? 'ĐANG DÙNG DỰ BÁO ĐÃ TẢI'
              : 'NHẮC TRÊN THIẾT BỊ · ĐANG BẬT'}
          </Text>
        ) : null}
      </View>

      {state.feedback === undefined ? null : (
        <Text accessibilityLiveRegion="polite" style={styles.feedback}>
          {state.feedback}
        </Text>
      )}

      <Text style={styles.platformNote}>
        {Platform.OS === 'android'
          ? 'Android có thể tiếp tục giới hạn âm thanh hoặc thông báo theo chế độ pin và kênh hệ thống.'
          : 'iOS có thể áp dụng chế độ Tập trung hoặc phân phối yên lặng theo cài đặt hệ thống.'}
      </Text>
    </NeoSheet>
  );
}
