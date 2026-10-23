/**
 * Các khối giao diện dự báo chi tiết theo giờ và theo ngày.
 * Nhận dữ liệu đã chuẩn hóa để hiển thị, không xử lý JSON thô của API.
 */
import { Text, View, FlatList } from 'react-native';
import type { ForecastDetailItem, DetailedHourlyItem, DailyForecastItem } from '@/utils/forecast';
import { WeatherConditionIcon } from '@/components/home-weather';
// Ctrl/Cmd + click để mở file chỉnh giao diện.
import { forecastDetailsStyles, detailedHourlyForecastStyles, dailyForecastRowStyles } from '@/css/components/forecast.styles';

// forecast-details

// Hiển thị các chỉ số dự báo chi tiết.
export function ForecastDetails({ items }: { readonly items: readonly ForecastDetailItem[] }) {
  return (
    <View style={forecastDetailsStyles.section} testID="forecast-details">
      <View style={forecastDetailsStyles.headingRow}>
        <Text accessibilityRole="header" style={forecastDetailsStyles.heading}>
          ÁNH SÁNG & TẦM NHÌN
        </Text>
        <Text style={forecastDetailsStyles.status}>THÔNG TIN PHỤ</Text>
      </View>
      {items.length === 0 ? (
        <Text style={forecastDetailsStyles.empty}>
          Chưa có dữ liệu thiên văn hoặc chi tiết khí quyển.
        </Text>
      ) : (
        <View style={forecastDetailsStyles.grid}>
          {items.map((item) => (
            <View key={item.label} style={forecastDetailsStyles.item}>
              <Text style={forecastDetailsStyles.label}>{item.label}</Text>
              <Text style={forecastDetailsStyles.value}>{item.value}</Text>
              <Text style={forecastDetailsStyles.note}>{item.note}</Text>
            </View>
          ))}
        </View>
      )}
      <Text style={forecastDetailsStyles.sourceNote}>
        Thời gian theo múi giờ của địa điểm đang xem.
      </Text>
    </View>
  );
}

// detailed-hourly-forecast

interface DetailedHourlyForecastProps {
  readonly items: readonly DetailedHourlyItem[];
  readonly unavailable: boolean;
}

// Hiển thị một mốc dự báo giờ.
function HourlyItem({ item }: { readonly item: DetailedHourlyItem }) {
  return (
    <View
      accessibilityLabel={`${item.timeLabel}, ${item.conditionLabel}, ${item.temperatureLabel}, ${item.precipitationLabel}${
        item.precipitationAmountLabel === undefined
          ? ''
          : `, lượng ${item.precipitationAmountLabel}`
      }`}
      style={[detailedHourlyForecastStyles.item, item.isCurrent && detailedHourlyForecastStyles.itemCurrent]}
    >
      <Text style={detailedHourlyForecastStyles.day}>{item.dayLabel ?? ' '}</Text>
      <Text
        style={[detailedHourlyForecastStyles.time, item.isCurrent && detailedHourlyForecastStyles.timeCurrent]}
      >
        {item.timeLabel}
      </Text>
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={detailedHourlyForecastStyles.iconWrap}
      >
        <WeatherConditionIcon condition={item.condition} isDay={item.isDay} size={60} />
      </View>
      <Text style={detailedHourlyForecastStyles.temperature}>{item.temperatureLabel}</Text>
      <Text style={detailedHourlyForecastStyles.condition}>{item.conditionLabel}</Text>
      <Text style={detailedHourlyForecastStyles.precipitation}>{item.precipitationLabel}</Text>
      <Text style={detailedHourlyForecastStyles.amount}>
        {item.precipitationAmountLabel ?? 'Lượng —'}
      </Text>
    </View>
  );
}

// Hiển thị danh sách dự báo theo giờ.
export function DetailedHourlyForecast({ items, unavailable }: DetailedHourlyForecastProps) {
  return (
    <View style={detailedHourlyForecastStyles.section} testID="detailed-hourly-forecast">
      <View style={detailedHourlyForecastStyles.headingRow}>
        <Text accessibilityRole="header" style={detailedHourlyForecastStyles.heading}>
          THEO GIỜ
        </Text>
        <Text style={detailedHourlyForecastStyles.status}>
          {unavailable ? 'CHƯA KHẢ DỤNG' : '24 GIỜ TỚI'}
        </Text>
      </View>
      <Text style={detailedHourlyForecastStyles.summary}>
        Vuốt ngang để so sánh thời điểm bạn định ra ngoài.
      </Text>

      {items.length === 0 ? (
        <View style={detailedHourlyForecastStyles.emptyState}>
          <Text style={detailedHourlyForecastStyles.emptyMark}>CHƯA CÓ</Text>
          <Text style={detailedHourlyForecastStyles.emptyCopy}>
            Chuỗi theo giờ chưa khả dụng. Không có giá trị thay thế được tạo ra.
          </Text>
        </View>
      ) : (
        <FlatList
          accessibilityLabel="Dự báo chi tiết theo giờ"
          contentContainerStyle={detailedHourlyForecastStyles.sequence}
          data={items}
          horizontal
          initialNumToRender={8}
          keyExtractor={(item) => item.id}
          maxToRenderPerBatch={8}
          nestedScrollEnabled
          removeClippedSubviews
          renderItem={({ item }) => <HourlyItem item={item} />}
          showsHorizontalScrollIndicator={false}
          windowSize={5}
        />
      )}
    </View>
  );
}

// daily-forecast-row

// Hiển thị dự báo của một ngày.
export function DailyForecastRow({ item }: { readonly item: DailyForecastItem }) {
  return (
    <View
      accessibilityLabel={`${item.dateLabel}, ${item.conditionLabel}, thấp nhất và cao nhất ${item.temperatureRangeLabel}, ${item.precipitationLabel}${
        item.amountLabel === undefined ? '' : `, tổng lượng ${item.amountLabel}`
      }`}
      style={dailyForecastRowStyles.row}
      testID={`daily-forecast-${item.id}`}
    >
      <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <WeatherConditionIcon condition={item.condition} isDay size={56} />
      </View>
      <View style={dailyForecastRowStyles.content}>
        <View style={dailyForecastRowStyles.primaryRow}>
          <Text style={dailyForecastRowStyles.date}>{item.dateLabel}</Text>
          <Text style={dailyForecastRowStyles.temperature}>{item.temperatureRangeLabel}</Text>
        </View>
        <View style={dailyForecastRowStyles.secondaryRow}>
          <Text style={dailyForecastRowStyles.condition}>{item.conditionLabel}</Text>
          <View style={dailyForecastRowStyles.precipitationBlock}>
            <Text style={dailyForecastRowStyles.precipitation}>{item.precipitationLabel}</Text>
            <Text style={dailyForecastRowStyles.amount}>{item.amountLabel ?? 'Lượng —'}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
