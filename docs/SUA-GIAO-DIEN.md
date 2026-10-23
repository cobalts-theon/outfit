# Tìm đúng file khi thầy yêu cầu sửa

Ứng dụng dùng React Native. File `.styles.ts` đóng vai trò tương tự CSS:
chứa màu, font, khoảng cách, kích thước và trạng thái hiển thị. Toàn bộ 23 file
style nằm trong `src/css/components`, `src/css/screens`, `src/css/context`. File `.tsx`
chứa component, nội dung và sự kiện; hook/service/utils xử lý dữ liệu và nghiệp vụ.

Trong VS Code: giữ **Ctrl + click** (macOS: Cmd + click) vào tên style hoặc đường
import `.styles`, hoặc đặt con trỏ vào tên style rồi nhấn **F12**.
Ví dụ `dailyActionPanelStyles.item` dẫn tới khối `item` trong file style tương ứng.

## Bản đồ chỉnh giao diện

| Phần cần sửa | Component / màn hình | File style riêng |
| --- | --- | --- |
| Bố cục Home, khoảng cách các phần | [home-screen.tsx](../src/screens/home-screen.tsx) | [home-screen.styles.ts](../src/css/screens/home-screen.styles.ts) |
| Khối “Nên làm ngay”, nút chọn giờ | [home-advice.tsx](../src/components/home-advice.tsx) | [home-advice.styles.ts](../src/css/components/home-advice.styles.ts) |
| Hình thời tiết, nhiệt độ, chỉ số môi trường | [home-weather.tsx](../src/components/home-weather.tsx) | [home-weather.styles.ts](../src/css/components/home-weather.styles.ts) |
| Dự báo tóm tắt và trạng thái dữ liệu Home | [home-forecast.tsx](../src/components/home-forecast.tsx) | [home-forecast.styles.ts](../src/css/components/home-forecast.styles.ts) |
| Màn hình dự báo chi tiết | [forecast-screen.tsx](../src/screens/forecast-screen.tsx) | [forecast-screen.styles.ts](../src/css/screens/forecast-screen.styles.ts) |
| Các dòng dự báo giờ/ngày | [forecast.tsx](../src/components/forecast.tsx) | [forecast.styles.ts](../src/css/components/forecast.styles.ts) |
| Màn hình chọn hoạt động và giờ | [plans-screen.tsx](../src/screens/plans-screen.tsx) | [plans-screen.styles.ts](../src/css/screens/plans-screen.styles.ts) |
| Form chọn ngày, kết quả đánh giá, giờ đã lưu | [plans.tsx](../src/components/plans.tsx) | [plans.styles.ts](../src/css/components/plans.styles.ts) |
| Đăng nhập, đăng ký, hồ sơ, ảnh đại diện | [account.tsx](../src/components/account.tsx) | [account.styles.ts](../src/css/components/account.styles.ts) |
| Sáu ô OTP và form xác minh | [email-otp.tsx](../src/components/email-otp.tsx) | [email-otp.styles.ts](../src/css/components/email-otp.styles.ts) |
| Tìm địa điểm và danh sách địa điểm lưu | [locations.tsx](../src/components/locations.tsx) | [locations.styles.ts](../src/css/components/locations.styles.ts) |
| Thanh trạng thái GPS/quyền vị trí | [location-capability.tsx](../src/components/location-capability.tsx) | [location-capability.styles.ts](../src/css/components/location-capability.styles.ts) |
| Menu, đầu trang và màn hình lỗi | [app-shell.tsx](../src/components/app-shell.tsx) | [app-shell.styles.ts](../src/css/components/app-shell.styles.ts) |
| Nút dùng chung, badge, sheet, hiệu ứng | [controls.tsx](../src/components/controls.tsx) | [controls.styles.ts](../src/css/components/controls.styles.ts) |
| Cài đặt thông báo | [notification-settings.tsx](../src/components/notification-settings.tsx) | [notification-settings.styles.ts](../src/css/components/notification-settings.styles.ts) |
| Form sở thích sinh hoạt | [lifestyle-setup.tsx](../src/components/lifestyle-setup.tsx) | [lifestyle-setup.styles.ts](../src/css/components/lifestyle-setup.styles.ts) |
| Màn hình thiết lập ban đầu | [before-start.tsx](../src/app/before-start.tsx) | [before-start.styles.ts](../src/css/screens/before-start.styles.ts) |
| Màn hình chào | [welcome-screen.tsx](../src/screens/welcome-screen.tsx) | [welcome-screen.styles.ts](../src/css/screens/welcome-screen.styles.ts) |
| Icon của lời khuyên | [recommendation-icon.tsx](../src/components/recommendation-icon.tsx) | [recommendation-icon.styles.ts](../src/css/components/recommendation-icon.styles.ts) |
| Lời khuyên chi tiết và bằng chứng | [recommendation-preview.tsx](../src/components/recommendation-preview.tsx) | [recommendation-preview.styles.ts](../src/css/components/recommendation-preview.styles.ts) |
| Hình thời tiết chuyển động trên điện thoại | [animated-weather-artwork.tsx](../src/components/animated-weather-artwork.tsx) | [animated-weather-artwork.styles.ts](../src/css/components/animated-weather-artwork.styles.ts) |
| Hình thời tiết chuyển động trên web | [animated-weather-artwork.web.tsx](../src/components/animated-weather-artwork.web.tsx) | [animated-weather-artwork.web.styles.ts](../src/css/components/animated-weather-artwork.web.styles.ts) |
| Màn hình chờ và thanh điều hướng | [app.tsx](../src/context/app.tsx) | [app.styles.ts](../src/css/context/app.styles.ts) |

## Ví dụ sửa nhanh lúc bảo vệ

**“Cho chữ trên nút lớn hơn”:** mở `css/components/controls.styles.ts`, tìm
`neoButtonStyles.text`, chỉnh `fontSize` và `lineHeight`. Nút dùng chung sẽ đổi
ở các màn hình sử dụng nó.

**“Đổi giao diện khối Nên làm ngay”:** mở `css/components/home-advice.styles.ts`.
`dailyActionPanelStyles.item` là mỗi dòng; `priority` là dòng ưu tiên;
`actionSurfaceStyle` chọn màu nền theo mức cảnh báo và vị trí hiển thị.

**“Đổi màu và font toàn app”:** mở [theme.ts](../src/theme.ts).
Style của từng phần lấy các token dùng chung từ đây. Muốn chỉ đổi một phần thì
chỉnh thuộc tính ở file `.styles.ts` của phần đó.

Các hàm style nhận kích thước hoặc trạng thái để dựng style động. Ví dụ
`artworkSizeStyle(size)` dùng kích thước do component cung cấp; phần định nghĩa
width/height nằm ở file style. Trạng thái nhấn/chọn vẫn do component quyết định.

## Bản đồ chỉnh chức năng

| Yêu cầu | Bắt đầu đọc/sửa |
| --- | --- |
| Đổi ngưỡng nóng/lạnh, gợi ý uống nước/trang phục | [comfort-rules.ts](../src/utils/comfort-rules.ts) |
| Đổi điều kiện mưa, UV, AQI tạo lời khuyên | [recommendation-rules.ts](../src/utils/recommendation-rules.ts) |
| Đổi cách xếp ưu tiên hoặc gộp lời khuyên trùng | [recommendation-engine.ts](../src/utils/recommendation-engine.ts) |
| Đổi câu hành động theo giờ/ngữ cảnh/sở thích | [recommendations.ts](../src/utils/recommendations.ts) |
| Đổi đánh giá hoạt động hoặc cách chọn giờ | [planning.ts](../src/utils/planning.ts) |
| Đổi thời gian tải lại/cache thời tiết | [live-weather.ts](../src/services/live-weather.ts) |
| Đổi thao tác lưu giờ hoặc dữ liệu kế hoạch | [hooks/plans.tsx](../src/hooks/plans.tsx), [services/plans.ts](../src/services/plans.ts) |
| Đổi luồng đăng nhập/hồ sơ | [hooks/account.ts](../src/hooks/account.ts), [services/account.ts](../src/services/account.ts) |
| Đổi xin quyền/lấy vị trí | [context/location.tsx](../src/context/location.tsx), [services/location.ts](../src/services/location.ts) |

Sau khi sửa, chạy `npm run typecheck`. Với thay đổi nghiệp vụ chạy thêm
`npm test -- --silent`; với UI hãy mở app để xem chữ, khoảng cách và trạng thái nhấn.
