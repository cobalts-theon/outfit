/**
 * Bộ tổng hợp quy tắc: phát hiện dữ liệu thiếu, gộp hành động trùng và xếp ưu tiên.
 */
import type { Recommendation, RecommendationEngineInput, RecommendationEvaluation, RecommendationInputDimension, RecommendationSeverity, RecommendationTrigger } from '@/types/weather';
import { evaluateInitialRecommendationRules, type RecommendationCandidate } from '@/utils/recommendation-rules';

// recommendation-engine

export const HOME_RECOMMENDATION_LIMIT = 3;

const severityRank: Record<RecommendationSeverity, number> = { info: 1, attention: 2, warning: 3, danger: 4 };

// So sánh mức độ và độ ưu tiên gợi ý.
function compareCandidates(a: RecommendationCandidate, b: RecommendationCandidate) {
  // Mức nguy hiểm cao hơn đứng trước; cùng mức thì xét priority rồi ruleId.
  const severityDifference = severityRank[b.severity] - severityRank[a.severity];
  if (severityDifference !== 0) return severityDifference;
  const priorityDifference = b.priority - a.priority;
  if (priorityDifference !== 0) return priorityDifference;
  return a.ruleId.localeCompare(b.ruleId);
}

// Loại bỏ các chuỗi trùng nhau.
function uniqueStrings(values: readonly string[]) {
  return [...new Set(values)];
}

// Gộp các bằng chứng trùng nhau.
function uniqueTriggers(values: readonly RecommendationTrigger[]) {
  const triggers = new Map<string, RecommendationTrigger>();
  for (const trigger of values) {
    const key = `${trigger.dimension}:${trigger.label}:${String(trigger.value ?? '')}:${trigger.unit ?? ''}`;
    if (!triggers.has(key)) triggers.set(key, trigger);
  }
  return [...triggers.values()];
}

interface MergedCandidate extends RecommendationCandidate {
  readonly matchedRuleIds: readonly string[];
}

// Gộp các hành động trùng và giữ bằng chứng.
function mergeDuplicateActions(candidates: readonly RecommendationCandidate[]): readonly MergedCandidate[] {
  // Cùng actionKey chỉ tạo một hành động, nhưng giữ bằng chứng từ các quy tắc.
  const merged = new Map<string, MergedCandidate>();

  for (const candidate of candidates) {
    const existing = merged.get(candidate.actionKey);
    if (existing === undefined) {
      merged.set(candidate.actionKey, { ...candidate, matchedRuleIds: [candidate.ruleId] });
      continue;
    }

    const winner = compareCandidates(existing, candidate) <= 0 ? existing : candidate;
    merged.set(candidate.actionKey, {
      ...winner,
      reasonParts: uniqueStrings([...existing.reasonParts, ...candidate.reasonParts]),
      triggers: uniqueTriggers([...existing.triggers, ...candidate.triggers]),
      matchedRuleIds: uniqueStrings([...existing.matchedRuleIds, candidate.ruleId]),
    });
  }

  return [...merged.values()];
}

// Đổi ứng viên thành lời khuyên hoàn chỉnh.
function toRecommendation(candidate: MergedCandidate): Recommendation {
  return {
    id: candidate.ruleId,
    matchedRuleIds: candidate.matchedRuleIds,
    actionKey: candidate.actionKey,
    group: candidate.group,
    severity: candidate.severity,
    priority: candidate.priority,
    title: candidate.title,
    message: candidate.message,
    reason: candidate.reasonParts.join(' '),
    action: candidate.action,
    triggers: candidate.triggers,
  };
}

// Gộp, xếp ưu tiên và giới hạn lời khuyên.
export function prioritizeRecommendationCandidates(candidates: readonly RecommendationCandidate[], limit = HOME_RECOMMENDATION_LIMIT): readonly Recommendation[] {
  const safeLimit = Number.isFinite(limit) ? Math.max(0, Math.floor(limit)) : 0;
  return [...mergeDuplicateActions(candidates)]
    .sort(compareCandidates)
    .slice(0, safeLimit)
    .map(toRecommendation);
}

// Liệt kê những đầu vào môi trường còn thiếu.
function missingDimensions(input: RecommendationEngineInput) {
  const current = input.currentWeather;
  if (current === undefined) {
    return ['current_weather', 'uv', 'us_aqi', 'precipitation', 'hourly_forecast'] as const satisfies readonly RecommendationInputDimension[];
  }

  const missing: RecommendationInputDimension[] = [];
  if (current.uv?.category === undefined) missing.push('uv');
  if (
    current.airQuality?.scale !== 'us_aqi' ||
    current.airQuality.category === undefined ||
    current.airQuality.category === 'unknown'
  ) {
    missing.push('us_aqi');
  }
  if (current.precipitation === undefined) missing.push('precipitation');
  if (input.hourlyForecast === undefined) missing.push('hourly_forecast');
  return missing;
}

// Đánh giá quy tắc và trả nhóm lời khuyên.
export function evaluateRecommendations(input: RecommendationEngineInput): RecommendationEvaluation {
  // 1. Ghi nhận đầu vào thiếu; không xem chỉ số chưa có là điều kiện an toàn.
  const missing = missingDimensions(input);
  const current = input.currentWeather;
  if (current === undefined) {
    return { status: 'unavailable', recommendations: [], missingDimensions: missing };
  }

  // 2. Chạy quy tắc. 3. Gộp hành động trùng và xếp ưu tiên trước khi trả về UI.
  const candidates = evaluateInitialRecommendationRules(current, input.hourlyForecast);
  const recommendations = prioritizeRecommendationCandidates(candidates, input.maxRecommendations);

  return {
    status: missing.length === 0 ? 'ready' : 'limited',
    recommendations,
    ...(recommendations[0] === undefined ? {} : { primary: recommendations[0] }),
    missingDimensions: missing,
  };
}

