/**
 * Các thành phần cho chọn giờ, xem đánh giá và hiển thị giờ đã lưu.
 * Dữ liệu đánh giá và thao tác được cung cấp qua hook lập kế hoạch.
 */
import { Pressable, Text, TextInput, View } from 'react-native';
import { useState, type ReactNode } from 'react';
import { NeoBadge, NeoButton, SlideReveal } from '@/components/controls';
import { RecommendationActionIcon } from '@/components/home-advice';
import { type ActivityAssessment, formatPlanTime, displayPlanningDate, localDate, preparationItems, activityLabel, ACTIVITIES } from '@/utils/planning';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/auth';
import { type ActivityPlan, type PlanChange, nextActivityPlan } from '@/services/plans';
import { useSavedPlanForecast } from '@/hooks/plans';
import { useRouter } from 'expo-router';
// Ctrl/Cmd + click để mở file chỉnh giao diện.
import { plannerControlsStyles, activityAssessmentCardStyles, savedPlanListStyles, upcomingPlanStyles } from '@/css/components/plans.styles';
import { plansLayoutStyles } from '@/css/components/plans.styles';

// planner-controls

// Hiển thị nhóm lựa chọn lập giờ.
export function PlannerChoices<T extends string | number>({ label, options, value, onChange }: {
  label: string;
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <View style={plannerControlsStyles.group}>
      <Text style={plannerControlsStyles.label}>{label}</Text>
      <View style={plannerControlsStyles.row}>
        {options.map((option) => (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityState={{ checked: value === option.value }}
            onPress={() => onChange(option.value)}
            style={({ pressed }) => [plannerControlsStyles.choice, value === option.value && plannerControlsStyles.selected, pressed && plannerControlsStyles.pressed]}
          >
            <Text style={plannerControlsStyles.copy}>{option.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

// Inline boxes keep custom choices close to the live environmental result.
// Hiển thị ô chọn có thể mở rộng.
function PlanningBox({ label, value, children }: {
  label: string;
  value: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <View style={plansLayoutStyles.dateField}>
      <Text style={plannerControlsStyles.label}>{label}</Text>
      <Pressable
        accessibilityRole="combobox"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={`${label}: ${value}`}
        onPress={() => setOpen(!open)}
        style={[plannerControlsStyles.choice, plansLayoutStyles.dateToggle]}
      >
        <Text style={[plannerControlsStyles.copy, plansLayoutStyles.shrinkText]}>
          {value || 'Chọn giá trị'}
        </Text>
        <Text style={plannerControlsStyles.copy}>{open ? '⌃' : '⌄'}</Text>
      </Pressable>
      <SlideReveal visible={open} style={plansLayoutStyles.fieldOptions}>
        {children}
      </SlideReveal>
    </View>
  );
}

// Hiển thị phần chọn ngày và thời lượng.
export function PlanningDateDuration({ date, duration, today, tomorrow, onDate, onDuration, commute = false }: {
  date: string;
  duration: string;
  today: string;
  tomorrow: string;
  onDate: (value: string) => void;
  onDuration: (value: string) => void;
  commute?: boolean;
}) {
  return (
    <View style={plansLayoutStyles.fieldsRow}>
      <PlanningBox label={commute ? 'Ngày đi' : 'Ngày muốn đánh giá'} value={date}>
        <NeoButton
          tone="secondary"
          label="HÔM NAY"
          onPress={() => onDate(displayPlanningDate(today))}
        />
        <NeoButton
          tone="secondary"
          label="NGÀY MAI"
          onPress={() => onDate(displayPlanningDate(tomorrow))}
        />
        <Text style={plannerControlsStyles.label}>Hoặc nhập ngày khác</Text>
        <TextInput
          accessibilityLabel="Ngày tùy chỉnh, DD/MM/YYYY"
          placeholder="DD/MM/YYYY"
          value={date}
          onChangeText={onDate}
          autoCorrect={false}
          maxLength={10}
          style={[plannerControlsStyles.choice, plannerControlsStyles.copy]}
        />
      </PlanningBox>
      <PlanningBox
        label={commute ? 'Thời gian di chuyển' : 'Thời lượng hoạt động'}
        value={duration ? `${duration} phút` : ''}
      >
        {(commute ? [15, 30, 60] : [30, 60, 90]).map((value) => (
          <NeoButton
            key={value}
            tone="secondary"
            label={`${value} PHÚT`}
            onPress={() => onDuration(String(value))}
          />
        ))}
        <Text style={plannerControlsStyles.label}>Tùy chỉnh số phút (1–1440)</Text>
        <TextInput
          accessibilityLabel="Thời lượng tùy chỉnh, số phút"
          inputMode="numeric"
          value={duration}
          onChangeText={onDuration}
          maxLength={5}
          selectTextOnFocus
          style={[plannerControlsStyles.choice, plannerControlsStyles.copy]}
        />
      </PlanningBox>
    </View>
  );
}

// activity-assessment-card

// Hiển thị kết quả đánh giá hoạt động.
export function ActivityAssessmentCard({ assessment, timeZone, title, onSave, busy }: {
  assessment: ActivityAssessment;
  timeZone: string;
  title?: string;
  onSave?: () => void;
  busy?: boolean;
}) {
  return (
    <View style={activityAssessmentCardStyles.card}>
      <NeoBadge
        label={
          title ??
          (assessment.status === 'suitable'
            ? 'CÓ THỂ CÂN NHẮC'
            : assessment.status === 'avoid'
              ? 'NÊN CHỌN GIỜ KHÁC'
              : assessment.status === 'unknown'
                ? 'CHƯA ĐỦ DỮ LIỆU'
                : 'CẦN CHUẨN BỊ')
        }
        tone={
          assessment.status === 'avoid'
            ? 'orange'
            : assessment.status === 'suitable'
              ? 'green'
              : undefined
        }
      />
      <Text style={activityAssessmentCardStyles.title}>
        {formatPlanTime(assessment.start, timeZone)} – {formatPlanTime(assessment.end, timeZone)}
      </Text>
      <Text style={activityAssessmentCardStyles.body}>{assessment.summary}</Text>
      <Text style={activityAssessmentCardStyles.fine}>{assessment.reasons.join(' · ')}</Text>
      <Text style={activityAssessmentCardStyles.fine}>
        Ước lượng từ dự báo theo giờ. Kiểm tra điều kiện thực tế trước khi đi.
      </Text>
      {assessment.checklist.length ? (
        <Text style={activityAssessmentCardStyles.heading}>Chuẩn bị trước khi đi</Text>
      ) : null}
      <View style={plansLayoutStyles.actionGroup}>
        {assessment.checklist.map((item) => (
          <View key={item.id} style={activityAssessmentCardStyles.check}>
            <RecommendationActionIcon compact actionKey={item.icon} primary={false} />
            <Text style={[activityAssessmentCardStyles.body, plansLayoutStyles.flexFill]}>{item.label}</Text>
          </View>
        ))}
      </View>
      {onSave && !['avoid', 'unknown'].includes(assessment.status) ? (
        <NeoButton disabled={busy} label="LƯU GIỜ NÀY" onPress={onSave} />
      ) : null}
    </View>
  );
}

// saved-hours

// Hiển thị đánh giá mới cho giờ đã lưu.
export function SavedPlanAdvice({ plan, now }: { plan: ActivityPlan; now: number }) {
  const forecast = useSavedPlanForecast(plan, now);
  const known = forecast.assessment.status !== 'unknown';
  return (
    <View style={plansLayoutStyles.savedGroup}>
      <Text style={savedPlanListStyles.body}>
        {forecast.loading ? 'Đang kiểm tra chỉ số môi trường…' : forecast.assessment.summary}
      </Text>
      <Text style={savedPlanListStyles.fine}>
        {(known ? forecast.assessment.reasons : plan.reasons).join(' · ')}
      </Text>
      <Text style={savedPlanListStyles.body}>
        {known
          ? forecast.assessment.checklist.map((item) => item.label).join(' · ') ||
            'Kiểm tra điều kiện thực tế trước khi đi.'
          : `Chuẩn bị đã lưu: ${plan.preparation}`}
      </Text>
    </View>
  );
}

// Hiển thị một giờ hoạt động đã lưu.
function SavedPlan({ plan, busy, now, onChange, initialExpanded = false }: {
  plan: ActivityPlan;
  busy: boolean;
  now: number;
  initialExpanded?: boolean;
  onChange: (id: string, change: PlanChange | 'delete') => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(initialExpanded);
  const [confirmRemove, setConfirmRemove] = useState(false);
  return (
    <View style={savedPlanListStyles.plan}>
      <Text style={savedPlanListStyles.status}>{activityLabel(plan.activity)}</Text>
      <Text style={savedPlanListStyles.heading}>
        {localDate(plan.starts_at, plan.time_zone)} ·{' '}
        {formatPlanTime(plan.starts_at, plan.time_zone)}–
        {formatPlanTime(plan.ends_at, plan.time_zone)}
      </Text>
      <Text style={savedPlanListStyles.body}>{plan.location_label}</Text>
      <NeoButton
        tone="neutral"
        label={expanded ? 'THU GỌN' : 'XEM CĂN CỨ & CHUẨN BỊ'}
        onPress={() => setExpanded(!expanded)}
      />
      <SlideReveal visible={expanded} style={plansLayoutStyles.upcomingGroup}>
        {expanded ? <SavedPlanAdvice plan={plan} now={now} /> : null}
        <Text style={savedPlanListStyles.fine}>
          Nhắc trước 15 phút. Dự báo được kiểm tra khi mở hoặc quay lại app.
        </Text>
        <NeoButton
          disabled={busy}
          tone={plan.reminder_enabled ? 'primary' : 'neutral'}
          label={plan.reminder_enabled ? 'TẮT NHẮC GIỜ NÀY' : 'NHẮC TRƯỚC GIỜ NÀY'}
          onPress={() => void onChange(plan.id, { reminder_enabled: !plan.reminder_enabled })}
        />
        <NeoButton
          disabled={busy}
          tone="secondary"
          label={confirmRemove ? 'XÁC NHẬN BỎ GIỜ NÀY' : 'BỎ GIỜ ĐÃ LƯU'}
          onPress={() =>
            confirmRemove ? void onChange(plan.id, { status: 'cancelled' }) : setConfirmRemove(true)
          }
        />
        {confirmRemove ? (
          <NeoButton tone="neutral" label="GIỮ LẠI" onPress={() => setConfirmRemove(false)} />
        ) : null}
      </SlideReveal>
    </View>
  );
}

// Hiển thị danh sách giờ đã lưu.
export function SavedPlanList({ plans, busy, now, onChange, initialExpanded = false }: {
  plans: ActivityPlan[];
  busy: boolean;
  now: number;
  initialExpanded?: boolean;
  onChange: (id: string, change: PlanChange | 'delete') => Promise<void>;
}) {
  const upcoming = plans.filter((plan) => plan.status === 'planned' && Date.parse(plan.starts_at) > now);
  if (!upcoming.length)
    return <Text style={savedPlanListStyles.body}>Chưa có giờ sắp tới được lưu.</Text>;
  return (
    <View style={savedPlanListStyles.list}>
      {upcoming.map((plan) => (
        <SavedPlan
          key={plan.id}
          plan={plan}
          busy={busy}
          now={now}
          onChange={onChange}
          initialExpanded={initialExpanded}
        />
      ))}
    </View>
  );
}

// upcoming-plan

// Lấy hoạt động đã lưu sắp diễn ra.
export function UpcomingPlan({ now }: { now: number }) {
  const { state } = useAuth();
  const owner = state.status === 'signed_in' ? state.user.id : undefined;
  const query = useQuery({
    queryKey: ['activity-plans', owner, 'upcoming'],
    enabled: Boolean(owner),
    queryFn: () => nextActivityPlan(owner!),
    refetchInterval: 30_000,
  });
  if (!owner) return null;
  if (query.isError)
    return (
      <View style={upcomingPlanStyles.outer}>
        <Text style={upcomingPlanStyles.body}>Chưa tải được kế hoạch sắp tới.</Text>
        <NeoButton tone="neutral" label="Tải lại kế hoạch" onPress={() => void query.refetch()} />
      </View>
    );
  if (!query.data || Date.parse(query.data.starts_at) <= now) return null;
  return <UpcomingPlanCard plan={query.data} now={now} />;
}

// Hiển thị thẻ hoạt động sắp diễn ra.
export function UpcomingPlanCard({ plan, now }: { plan: ActivityPlan; now: number }) {
  const router = useRouter(),
    forecast = useSavedPlanForecast(plan, now);
  const items =
    forecast.assessment.status === 'unknown'
      ? preparationItems(plan.preparation)
      : forecast.assessment.checklist.map((item) => [item.id, item.label]);
  const today = localDate(now, plan.time_zone) === localDate(plan.starts_at, plan.time_zone);
  return (
    <View style={upcomingPlanStyles.outer}>
      <View style={upcomingPlanStyles.card}>
        <NeoBadge label="GIỜ ĐÃ LƯU SẮP TỚI" />
        <View style={upcomingPlanStyles.row}>
          <RecommendationActionIcon
            compact
            actionKey={
              ACTIVITIES.find((item) => item.id === plan.activity)?.icon ??
              'outdoor-activity-window'
            }
            primary={false}
          />
          <Text style={upcomingPlanStyles.title}>
            {activityLabel(plan.activity)} · {formatPlanTime(plan.starts_at, plan.time_zone)}
          </Text>
        </View>
        <Text style={upcomingPlanStyles.body}>
          {today ? 'Hôm nay' : localDate(plan.starts_at, plan.time_zone)} · {plan.location_label}
        </Text>
        <Text style={upcomingPlanStyles.body}>
          {forecast.loading ? 'Đang kiểm tra chỉ số môi trường…' : forecast.assessment.summary}
        </Text>
        <Text style={upcomingPlanStyles.fine}>
          {items.length
            ? `Chuẩn bị: ${items.map(([, label]) => label.toLowerCase()).join(', ')}.`
            : 'Kiểm tra điều kiện thực tế trước khi đi.'}
        </Text>
        <NeoButton
          tone={forecast.assessment.status === 'avoid' ? 'primary' : 'secondary'}
          label="Xem giờ đã lưu"
          onPress={() => router.navigate({ pathname: '/plans', params: { planId: plan.id } })}
        />
      </View>
    </View>
  );
}
