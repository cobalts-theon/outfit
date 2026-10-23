import { useState } from 'react';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { NeoButton, SlideIn, TimeDropdown, formatClock } from '@/components/controls';
import { saveLifestylePreferences } from '@/services/account';
import {
  activityOptions,
  periodOptions,
  type Activity,
  type LifestylePreferences,
} from '@/utils/recommendations';
import { recommendationIconAssets } from '@/components/home-advice';
import { homeVisualTokens, radii, spacing, typography } from '@/theme';

// lifestyle-setup

const icons = {
  ...recommendationIconAssets,
  bicycle: require('../../assets/lifestyle/bicycle.svg'),
  motorbike: require('../../assets/lifestyle/motorbike.svg'),
  car: require('../../assets/lifestyle/car.svg'),
};

type Icon = keyof typeof icons;

const activityIcons: Record<Activity, Icon> = {
  wellness: 'temperature-high',
  commute: 'umbrella',
  exercise: 'shoes',
  clothing: 'shirt',
  laundry: 'hanger',
};

const transportOptions = [
  { key: 'walk', label: 'Đi bộ', icon: 'shoes' },
  { key: 'bike', label: 'Xe đạp', icon: 'bicycle' },
  { key: 'motorbike', label: 'Xe máy', icon: 'motorbike' },
  { key: 'covered', label: 'Ô tô / xe buýt', icon: 'car' },
  { key: 'none', label: 'Ít di chuyển', icon: 'shelter' },
] as const;

function Pick({
  label,
  icon,
  checked,
  onPress,
  disabled,
  single = false,
}: {
  label: string;
  icon: Icon;
  checked: boolean;
  onPress: () => void;
  disabled: boolean;
  single?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole={single ? 'radio' : 'checkbox'}
      accessibilityLabel={label}
      accessibilityState={{ checked, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.pick, checked && styles.selected, pressed && styles.pressed]}
    >
      <View style={[styles.iconFrame, checked && styles.iconSelected]}>
        <Image
          source={icons[icon]}
          style={styles.icon}
          contentFit="contain"
          accessibilityElementsHidden
        />
      </View>
      <Text style={styles.pickText}>{label}</Text>
      <View style={[styles.checkFrame, checked && styles.checkSelected]}>
        <Text style={styles.check}>{checked ? '✓' : ''}</Text>
      </View>
    </Pressable>
  );
}

export function LifestyleSetup({
  initial,
  onboarding,
  onClose,
  onStepChange,
}: {
  initial?: LifestylePreferences;
  onboarding: boolean;
  onClose: (saved?: boolean) => void;
  onStepChange?: () => void;
}) {
  const [step, setStep] = useState(0);
  const [activities, setActivities] = useState<Activity[]>(initial?.activities ?? []);
  const [transport, setTransport] = useState<LifestylePreferences['transport']>(initial?.transport);
  const [exposure, setExposure] = useState<LifestylePreferences['exposure']>(initial?.exposure);
  const [start, setStart] = useState<number | undefined>(initial?.availability?.start);
  const [end, setEnd] = useState<number | undefined>(initial?.availability?.end);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const goTo = (next: number) => {
    setError('');
    setStep(next);
    onStepChange?.();
  };
  const validation = (section: number) => {
    if (section === 0 && !activities.length) return 'Chọn ít nhất một nhu cầu phù hợp với bạn.';
    if (section === 1 && (!transport || !exposure))
      return 'Chọn cách di chuyển và thời gian ở ngoài trời.';
    if (
      section === 2 &&
      (start !== undefined || end !== undefined) &&
      (start === undefined || end === undefined || start === end)
    )
      return 'Chọn giờ bắt đầu và kết thúc khác nhau.';
    return '';
  };
  const save = async (skip = false) => {
    const invalid = skip ? '' : [0, 1, 2].map(validation).find(Boolean);
    if (invalid) {
      setError(invalid);
      return;
    }
    setPending(true);
    setError('');
    try {
      await saveLifestylePreferences(
        skip
          ? undefined
          : {
              version: 1,
              activities,
              periods: periodOptions.map((p) => p.key),
              ...(start !== undefined && end !== undefined ? { availability: { start, end } } : {}),
              transport,
              exposure,
            },
      );
      onClose(true);
    } catch {
      setError('Chưa lưu được. Kiểm tra kết nối rồi thử lại; lựa chọn vẫn được giữ.');
    } finally {
      setPending(false);
    }
  };
  return (
    <SlideIn horizontal={onboarding} replayKey={String(step)} style={styles.container}>
      {onboarding ? (
        <View style={styles.intro}>
          <View style={styles.progressHeading}>
            <Text style={styles.progress}>BƯỚC {step + 1} / 3</Text>
            <Text style={styles.progressName}>{['Nhu cầu', 'Sinh hoạt', 'Giờ rảnh'][step]}</Text>
          </View>
          <View style={styles.progressTrack} accessibilityLabel={`Bước ${step + 1} trên 3`}>
            {[0, 1, 2].map((index) => (
              <View
                key={index}
                style={[
                  styles.progressSegment,
                  index < step && styles.progressDone,
                  index === step && styles.progressActive,
                ]}
              />
            ))}
          </View>
        </View>
      ) : null}
      {!onboarding || step === 0 ? (
        <View style={styles.group}>
          <Text accessibilityRole="header" style={styles.heading}>
            Bạn muốn được hỗ trợ gì?
          </Text>
          <Text style={styles.body}>Chọn một hoặc nhiều nhu cầu thường gặp.</Text>
          {activityOptions.map((o) => (
            <Pick
              key={o.key}
              label={o.label}
              icon={activityIcons[o.key]}
              checked={activities.includes(o.key)}
              disabled={pending}
              onPress={() =>
                setActivities((a) =>
                  a.includes(o.key) ? a.filter((k) => k !== o.key) : [...a, o.key],
                )
              }
            />
          ))}
        </View>
      ) : null}
      {!onboarding || step === 1 ? (
        <>
          <View style={styles.group}>
            <Text accessibilityRole="header" style={styles.heading}>
              Bạn thường di chuyển bằng gì?
            </Text>
            {transportOptions.map((o) => (
              <Pick
                key={o.key}
                single
                label={o.label}
                icon={o.icon}
                checked={transport === o.key}
                disabled={pending}
                onPress={() => setTransport(o.key)}
              />
            ))}
          </View>
          <View style={styles.group}>
            <Text accessibilityRole="header" style={styles.heading}>
              Mỗi ngày bạn ở ngoài trời bao lâu?
            </Text>
            <Pick
              single
              label="Dưới 1 giờ"
              icon="shelter"
              checked={exposure === 'short'}
              disabled={pending}
              onPress={() => setExposure('short')}
            />
            <Pick
              single
              label="Từ 1 giờ trở lên"
              icon="temperature-high"
              checked={exposure === 'long'}
              disabled={pending}
              onPress={() => setExposure('long')}
            />
          </View>
        </>
      ) : null}
      {!onboarding || step === 2 ? (
        <View style={styles.group}>
          <Text accessibilityRole="header" style={styles.heading}>
            Giờ rảnh thường dùng (tùy chọn)
          </Text>
          <Text style={styles.body}>
            Nếu điền, app tự dùng khoảng giờ này khi tìm giờ phù hợp. Bạn có thể thay đổi cho từng
            lần xem.
          </Text>
          <View style={styles.timeRow}>
            <TimeDropdown label="Từ lúc" value={start} onChange={setStart} disabled={pending} />
            <TimeDropdown label="Đến lúc" value={end} onChange={setEnd} disabled={pending} />
          </View>
          {start !== undefined && end !== undefined && start !== end ? (
            <Text style={styles.summary}>
              Giờ rảnh: {formatClock(start)}–{formatClock(end)}
              {end < start ? ' (qua ngày hôm sau)' : ''}.
            </Text>
          ) : null}
          {!initial?.availability && initial ? (
            <Text style={styles.body}>
              Bạn đã chọn theo buổi trước đây. Chọn lại giờ cụ thể để cập nhật.
            </Text>
          ) : null}
          <Text style={styles.body}>
            Ứng dụng chỉ gợi ý hoạt động khi thời tiết phù hợp; cảnh báo quan trọng luôn được giữ.
          </Text>
        </View>
      ) : null}
      {error ? (
        <Text accessibilityLiveRegion="polite" style={styles.error}>
          {error}
        </Text>
      ) : null}
      {onboarding && step < 2 ? (
        <NeoButton
          tone="accent"
          disabled={pending}
          label="TIẾP TỤC  →"
          onPress={() => {
            const message = validation(step);
            if (message) setError(message);
            else goTo(step + 1);
          }}
        />
      ) : (
        <NeoButton
          tone="accent"
          disabled={pending}
          label={pending ? 'ĐANG LƯU…' : onboarding ? 'BẮT ĐẦU' : 'LƯU THAY ĐỔI'}
          onPress={() => void save()}
        />
      )}
      {onboarding && step > 0 ? (
        <NeoButton
          disabled={pending}
          tone="neutral"
          label="←  QUAY LẠI"
          onPress={() => goTo(step - 1)}
        />
      ) : null}
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: pending }}
        disabled={pending}
        onPress={() => (onboarding ? void save(true) : onClose(false))}
        style={styles.defer}
      >
        <Text style={styles.deferText}>{onboarding ? 'Thiết lập sau' : 'Hủy thay đổi'}</Text>
      </Pressable>
    </SlideIn>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.md, paddingBottom: spacing.sm },
  intro: { gap: spacing.sm },
  group: { gap: spacing.sm },
  heading: {
    fontFamily: typography.heading,
    fontSize: 18,
    lineHeight: 26,
    color: homeVisualTokens.ink,
  },
  body: { fontFamily: typography.body, fontSize: 13, lineHeight: 21, color: homeVisualTokens.ink },
  progressHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  progress: { fontFamily: typography.heading, fontSize: 11, color: homeVisualTokens.ink },
  progressName: { fontFamily: typography.body, fontSize: 12, color: homeVisualTokens.ink },
  progressTrack: { flexDirection: 'row', gap: spacing.xs },
  progressSegment: {
    flex: 1,
    height: 10,
    backgroundColor: homeVisualTokens.paleBlueField,
    borderWidth: 2,
    borderColor: homeVisualTokens.ink,
    borderRadius: radii.control,
  },
  progressActive: { backgroundColor: homeVisualTokens.infoSurface },
  progressDone: { backgroundColor: homeVisualTokens.mint },
  defer: { minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  deferText: {
    color: homeVisualTokens.ink,
    fontFamily: typography.body,
    fontSize: 13,
    textDecorationLine: 'underline',
  },
  pick: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    borderWidth: 3,
    borderRadius: radii.control,
    borderColor: homeVisualTokens.ink,
    backgroundColor: homeVisualTokens.field,
  },
  selected: { backgroundColor: homeVisualTokens.field, boxShadow: '3px 3px 0px #1D3557' },
  pressed: { transform: [{ translateX: 2 }] },
  iconFrame: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.control,
    backgroundColor: homeVisualTokens.paper,
  },
  iconSelected: { backgroundColor: homeVisualTokens.sunflower },
  icon: { width: 28, height: 28 },
  checkFrame: {
    width: 26,
    height: 26,
    borderWidth: 2,
    borderRadius: radii.control,
    borderColor: homeVisualTokens.ink,
    backgroundColor: homeVisualTokens.paper,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkSelected: { backgroundColor: homeVisualTokens.mint },
  check: {
    fontFamily: typography.heading,
    fontSize: 17,
    lineHeight: 21,
    color: homeVisualTokens.ink,
  },
  pickText: {
    flex: 1,
    fontFamily: typography.body,
    fontSize: 15,
    lineHeight: 23,
    color: homeVisualTokens.ink,
  },
  timeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  summary: {
    fontFamily: typography.body,
    fontSize: 14,
    color: homeVisualTokens.ink,
    lineHeight: 22,
    padding: spacing.sm,
    backgroundColor: homeVisualTokens.sunflower,
    borderRadius: radii.control,
  },
  error: {
    padding: spacing.sm,
    backgroundColor: homeVisualTokens.sunflower,
    color: homeVisualTokens.ink,
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 21,
  },
});
