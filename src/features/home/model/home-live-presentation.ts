import type {
  HomeRiskPreview,
  HomeRiskTone,
} from '@/features/home/model/home-prototype';
import {
  evaluateRecommendations,
} from '@/features/recommendations/domain/recommendation-engine';
import type {
  RecommendationEvaluation,
  RecommendationSeverity,
} from '@/features/recommendations/domain/recommendation';
import type { LiveCurrentWeatherResult } from '@/features/weather/application/live-current-weather';

const riskTone: Record<RecommendationSeverity, HomeRiskTone> = {
  info: 'calm',
  attention: 'attention',
  warning: 'warning',
  danger: 'danger',
};

const riskLevel: Record<RecommendationSeverity, string> = {
  info: 'THÔNG TIN',
  attention: 'LƯU Ý',
  warning: 'CẢNH BÁO',
  danger: 'NGUY HIỂM',
};

export interface HomeLiveRecommendationPresentation {
  readonly evaluation: RecommendationEvaluation;
  readonly risk: HomeRiskPreview;
}

export function createRecommendationRisk(
  evaluation: RecommendationEvaluation,
): HomeRiskPreview {
  const primaryRisk = evaluation.recommendations.find(
    (recommendation) => recommendation.severity !== 'info',
  );

  if (primaryRisk !== undefined) {
    return {
      tone: riskTone[primaryRisk.severity],
      levelLabel: riskLevel[primaryRisk.severity],
      title: primaryRisk.title,
      reason: primaryRisk.reason,
      immediateAction: primaryRisk.action,
    };
  }

  if (evaluation.status !== 'ready') {
    return {
      tone: 'unavailable',
      levelLabel: 'DỮ LIỆU MỘT PHẦN',
      title: 'Chưa thể loại trừ rủi ro môi trường',
      reason:
        'Một số đầu vào của Rule Engine chưa khả dụng; dữ liệu trống không được xem là trạng thái an toàn.',
      immediateAction:
        'Dùng các gợi ý được hỗ trợ bởi số đo hiện có và kiểm tra lại khi dữ liệu đầy đủ hơn.',
    };
  }

  return {
    tone: 'calm',
    levelLabel: 'ỔN ĐỊNH',
    title: 'Chưa có rủi ro nổi bật',
    reason: 'Các quy tắc ban đầu không phát hiện điều kiện cần ưu tiên từ dữ liệu hiện có.',
    immediateAction:
      'Có thể tiếp tục kế hoạch và kiểm tra lại khi thời tiết hoặc chỉ số môi trường thay đổi.',
  };
}

export function createLiveRecommendationPresentation(
  result: LiveCurrentWeatherResult,
): HomeLiveRecommendationPresentation {
  const evaluation = evaluateRecommendations({
    currentWeather: result.weather,
    hourlyForecast: result.hourlyForecast,
  });

  return {
    evaluation,
    risk: createRecommendationRisk(evaluation),
  };
}
