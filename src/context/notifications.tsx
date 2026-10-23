import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AppState, Linking } from 'react-native';
import { useAuth } from '@/context/auth';
import type { RecommendationNotificationEvent } from '@/utils/recommendations';
import {
  upsertCloudNotificationPreference,
  retireActionReminders,
  cancelRecommendationNotifications,
  configureWeatherNotificationChannel,
  hasWeatherNotificationPermission,
  readNotificationPreference,
  requestWeatherNotificationPermission,
  resolveRemotePushCapability,
  sendTestWeatherNotification,
  syncRecommendationNotifications,
  writeNotificationPreference,
  type RemotePushCapability,
} from '@/services/notifications';

// notification-provider

export type NotificationPreferenceStatus =
  | 'loading'
  | 'disabled'
  | 'enabling'
  | 'enabled'
  | 'denied'
  | 'error';

export interface NotificationPreferenceState {
  readonly status: NotificationPreferenceStatus;
  readonly remotePush: RemotePushCapability;
  readonly feedback?: string;
}

interface NotificationContextValue {
  readonly state: NotificationPreferenceState;
  readonly enable: () => Promise<void>;
  readonly disable: () => Promise<void>;
  readonly openSettings: () => Promise<void>;
  readonly sendTest: () => Promise<void>;
  readonly sync: (events: readonly RecommendationNotificationEvent[]) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: PropsWithChildren) {
  const { state: authState } = useAuth();
  const userId = authState.status === 'signed_in' ? authState.user.id : undefined;
  const notificationsActiveRef = useRef(false);
  const syncQueueRef = useRef<Promise<void>>(Promise.resolve());
  const [state, setState] = useState<NotificationPreferenceState>({
    status: 'loading',
    remotePush: 'local_only',
  });

  useEffect(() => {
    let active = true;

    void (async () => {
      try {
        await retireActionReminders();
        await configureWeatherNotificationChannel();
        const enabled = readNotificationPreference();
        const granted = enabled ? await hasWeatherNotificationPermission() : false;
        if (!active) return;
        notificationsActiveRef.current = enabled && granted;
        setState({
          status: enabled ? (granted ? 'enabled' : 'denied') : 'disabled',
          remotePush: 'local_only',
          ...(enabled && !granted
            ? { feedback: 'Quyền thông báo đã bị tắt trong Cài đặt hệ thống.' }
            : {}),
        });
      } catch {
        if (active) {
          notificationsActiveRef.current = false;
          setState({
            status: 'error',
            remotePush: 'local_only',
            feedback: 'Không thể đọc trạng thái thông báo trên thiết bị.',
          });
        }
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (state.status !== 'enabled' && state.status !== 'denied') return;

    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState !== 'active') return;
      void (async () => {
        const granted = await hasWeatherNotificationPermission().catch(() => false);
        if (granted) {
          notificationsActiveRef.current = true;
          writeNotificationPreference(true);
          setState((current) =>
            current.status === 'enabled'
              ? current
              : {
                  status: 'enabled',
                  remotePush: 'local_only',
                  feedback: 'Quyền hệ thống đã được bật; cảnh báo trên thiết bị đang hoạt động.',
                },
          );
          return;
        }

        notificationsActiveRef.current = false;
        setState((current) =>
          current.status === 'denied'
            ? current
            : {
                status: 'denied',
                remotePush: 'local_only',
                feedback: 'Quyền thông báo đã bị tắt trong Cài đặt hệ thống.',
              },
        );
      })();
    });

    return () => subscription.remove();
  }, [state.status]);

  const persistCloudPreference = useCallback(
    async (enabled: boolean): Promise<boolean | undefined> => {
      if (userId === undefined) return undefined;

      try {
        await upsertCloudNotificationPreference(userId, enabled);
        return true;
      } catch {
        return false;
      }
    },
    [userId],
  );

  const enable = useCallback(async () => {
    setState((current) => ({ ...current, status: 'enabling', feedback: undefined }));
    try {
      const wasEnabled = readNotificationPreference();
      const granted = await requestWeatherNotificationPermission();
      if (!granted) {
        notificationsActiveRef.current = false;
        writeNotificationPreference(false);
        setState({
          status: 'denied',
          remotePush: 'local_only',
          feedback: 'Quyền thông báo đang bị tắt. Bạn có thể mở Cài đặt hệ thống để bật lại.',
        });
        return;
      }

      notificationsActiveRef.current = true;
      writeNotificationPreference(true);
      const remotePush = await resolveRemotePushCapability();
      const cloudSynced = await persistCloudPreference(true);
      let testFailed = false;
      if (!wasEnabled) {
        try {
          await sendTestWeatherNotification();
        } catch {
          testFailed = true;
        }
      }
      setState({
        status: 'enabled',
        remotePush,
        feedback: testFailed
          ? 'Đã bật nhưng chưa gửi được thông báo xác nhận. Bấm gửi thử hoặc kiểm tra cài đặt hệ thống.'
          : cloudSynced === false
            ? 'Cảnh báo đã bật trên thiết bị nhưng chưa đồng bộ được với tài khoản.'
            : cloudSynced === true
              ? 'Đã bật cảnh báo và đồng bộ tùy chọn với tài khoản.'
              : 'Đã bật cảnh báo mưa, trang phục và rủi ro môi trường cần hành động.',
      });
    } catch {
      notificationsActiveRef.current = false;
      setState({
        status: 'error',
        remotePush: 'local_only',
        feedback: 'Không thể bật thông báo lúc này. Hãy thử lại sau.',
      });
    }
  }, [persistCloudPreference]);

  const disable = useCallback(async () => {
    notificationsActiveRef.current = false;
    writeNotificationPreference(false);
    syncQueueRef.current = syncQueueRef.current
      .catch(() => undefined)
      .then(cancelRecommendationNotifications);
    await syncQueueRef.current;
    const cloudSynced = await persistCloudPreference(false);
    setState({
      status: 'disabled',
      remotePush: 'local_only',
      feedback:
        cloudSynced === false
          ? 'Đã tắt cảnh báo trên thiết bị nhưng chưa đồng bộ được với tài khoản.'
          : cloudSynced === true
            ? 'Đã tắt cảnh báo, hủy lịch đang chờ và đồng bộ với tài khoản.'
            : 'Đã tắt và hủy các cảnh báo đang chờ trên thiết bị.',
    });
  }, [persistCloudPreference]);

  const sendTest = useCallback(async () => {
    try {
      if (!(await hasWeatherNotificationPermission())) {
        setState({
          status: 'denied',
          remotePush: 'local_only',
          feedback: 'Thông báo bị chặn. Mở Cài đặt hệ thống và cho phép thông báo của Expo Go/app.',
        });
        return;
      }
      await sendTestWeatherNotification();
      setState((current) => ({
        ...current,
        feedback:
          'Đã gửi thông báo thử ngay. Kéo thanh thông báo xuống để kiểm tra; trong Expo Go, thông báo có thể mang tên Expo Go.',
      }));
    } catch {
      setState((current) => ({
        ...current,
        feedback: 'Không thể gửi thông báo thử. Hãy kiểm tra quyền thông báo của hệ thống.',
      }));
    }
  }, []);

  const sync = useCallback(
    async (events: readonly RecommendationNotificationEvent[]) => {
      if (state.status !== 'enabled') return;
      syncQueueRef.current = syncQueueRef.current
        .catch(() => undefined)
        .then(() =>
          notificationsActiveRef.current ? syncRecommendationNotifications(events) : undefined,
        );
      await syncQueueRef.current.catch(() => {
        const feedback =
          'Chưa lên lịch được cảnh báo. Thử thông báo thử hoặc kiểm tra cài đặt hệ thống.';
        setState((current) => (current.feedback === feedback ? current : { ...current, feedback }));
      });
    },
    [state.status],
  );

  const openSettings = useCallback(async () => {
    await Linking.openSettings();
  }, []);

  const value = useMemo(
    () => ({ state, enable, disable, openSettings, sendTest, sync }),
    [disable, enable, openSettings, sendTest, state, sync],
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  const value = useContext(NotificationContext);
  if (value === null) {
    throw new Error('useNotifications must be used inside NotificationProvider.');
  }
  return value;
}
