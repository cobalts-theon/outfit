import type { HomeRiskPreview } from '@/features/home/model/home-prototype';
import type { LiveCurrentWeatherResult } from '@/features/weather/application/live-current-weather';

export function createLiveObservationRisk(
  result: LiveCurrentWeatherResult,
): HomeRiskPreview {
  const environmentalIssues = result.issues.filter(
    (issue) => issue.source === 'air_quality',
  );

  if (environmentalIssues.length > 0) {
    return {
      tone: 'unavailable',
      levelLabel: 'DỮ LIỆU MỘT PHẦN',
      title: 'Chưa đủ dữ liệu để đánh giá rủi ro',
      reason: `Thời tiết hiện tại đã cập nhật, nhưng ${environmentalIssues
        .map((issue) => issue.message.toLocaleLowerCase('vi-VN'))
        .join(' ')}`,
      immediateAction:
        'Có thể đọc điều kiện thời tiết đang có; không xem AQI hoặc UV bị trống là trạng thái an toàn.',
    };
  }

  const { airQuality, uv } = result.weather;
  const aqiReading =
    airQuality === undefined
      ? 'AQI không khả dụng'
      : `AQI ${Math.round(airQuality.index)} (${airQuality.scale ?? 'không rõ thang'})`;
  const uvReading = uv === undefined ? 'UV không khả dụng' : `UV ${uv.index.toFixed(1)}`;

  return {
    tone: 'unavailable',
    levelLabel: 'CHỈ SỐ TRỰC TIẾP',
    title: 'Chưa bật đánh giá rủi ro tự động',
    reason: `${aqiReading}; ${uvReading}. Đây là số đo trực tiếp, chưa phải kết luận từ rule engine.`,
    immediateAction:
      'Chỉ dùng các số đo hiện tại để tham khảo; khuyến nghị live sẽ được nối ở giai đoạn rule engine.',
  };
}
