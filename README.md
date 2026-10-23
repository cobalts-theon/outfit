# Thời tiết & gợi ý sinh hoạt

Ứng dụng React Native / Expo SDK 57 giúp chọn hoạt động và chuẩn bị theo thời
tiết, AQI, UV và dự báo. Có thể xem khuyến nghị không cần đăng nhập; tài khoản dùng để lưu và đồng bộ.
Home ưu tiên lời khuyên có căn cứ, thay đổi sắp tới và giờ phù hợp để ra ngoài. Không sử dụng chatbot AI.

## Chạy dự án

Yêu cầu Node.js phù hợp Expo SDK 57 (tối thiểu 22.13.x) và npm.

```sh
npm ci
cp .env.example .env
npm run start
```

Điền `EXPO_PUBLIC_SUPABASE_URL` và `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` vào
`.env`. Chỉ dùng khóa public; không đưa service-role/secret key vào ứng dụng.
Thiếu cấu hình, ứng dụng hiển thị trạng thái dịch vụ chưa sẵn sàng.

```sh
npm run android
npm run ios
npm run web
```

Android/iOS là nền tảng chính. iOS native cần macOS và môi trường Apple.
Thiết lập email xác nhận/khôi phục nằm trong [EMAIL_OTP.md](docs/EMAIL_OTP.md).
Hàm server gửi OTP trực tiếp qua Gmail; Google OAuth credentials chỉ nằm ở server,
không đưa vào code hoặc biến môi trường công khai của app.

## Cấu trúc dự án

`src` có **81 file TypeScript**, tính cả 6 route, file dành riêng cho web và kiểu
schema database: **58 file ứng dụng + 23 file `.styles.ts`**. Test, thư viện và
file được Expo sinh nằm ngoài số này.

```text
weather/
├── src/
│   ├── app/                 # 6 file: route, layout; trang before-start nằm tại đây
│   ├── screens/             # 4 màn hình: Home, Forecast, Plans, Welcome
│   ├── components/          # 17 nhóm UI, không chứa file style
│   ├── context/             # 4 context: app, auth, location, notifications
│   ├── css/                 # 23 file style riêng
│   │   ├── components/      # 17 file style của các nhóm UI
│   │   ├── screens/         # 5 file style màn hình (có before-start)
│   │   └── context/         # app.styles.ts: chờ tải và điều hướng
│   ├── hooks/               # 3 file: account, home, plans
│   ├── services/            # 6 file: account, live-weather, location,
│   │                        #         notifications, plans, supabase
│   │   └── weather/         # 5 file: request, responses, adapters, current-adapter, client
│   ├── utils/               # 8 file: dự báo, đánh giá hoạt động/đi bộ, kiểm tra dữ liệu,
│   │                        #         bộ tổng hợp và các nhóm quy tắc khuyến nghị
│   ├── types/               # 2 file: weather, database
│   ├── constants/           # 2 file: demo-weather, weather-fixtures
│   └── theme.ts             # 1 file: màu sắc, font và khoảng cách
├── tests/                   # Test và mock native dành riêng cho Node/Jest
├── assets/                  # Hình/icon đang dùng và giấy phép
├── artifacts/               # Ảnh kiểm thử và tài nguyên cũ được nén
├── supabase/                # Migration, mẫu email và hàm server gửi OTP Gmail
├── docs/                    # Tài liệu sản phẩm và kỹ thuật
├── app.json
├── package.json
└── .env.example
```

Mỗi file UI chứa các component liên quan, vẫn giữ tên hàm riêng. Ví dụ
`components/account.tsx` gồm sheet, form đăng nhập, hồ sơ và ảnh đại diện;
`components/home-weather.tsx` gồm phần hiển thị thời tiết, chỉ số và icon.
Mỗi hàm/component có comment `//` tiếng Việt ngắn để biết vai trò; các nhóm
style cũng có nhãn giải thích để tìm đúng phần cần sửa.
Style nằm riêng trong `src/css/`, chia theo `components`, `screens`, `context`;
file `.styles.ts` giữ cùng tên phần giao diện. Giữ Ctrl/Cmd và click tên style
hoặc đường import để mở đúng file; nhấn F12 cũng đi tới định nghĩa.
[Bản đồ sửa giao diện và chức năng](docs/SUA-GIAO-DIEN.md) có link cho từng phần.

| Muốn sửa | Bắt đầu ở |
| --- | --- |
| Bố cục Home | `screens/home-screen.tsx` |
| Nội dung gợi ý trên Home | `components/home-advice.tsx` |
| Chỉ số và icon thời tiết | `components/home-weather.tsx` |
| Đăng nhập/hồ sơ | `components/account.tsx`, `hooks/account.ts` |
| Tìm/chọn địa điểm | `components/locations.tsx`, `context/location.tsx` |
| Lập kế hoạch | `screens/plans-screen.tsx`, `hooks/plans.tsx` |
| Bộ tổng hợp gợi ý | `utils/recommendation-engine.ts` |
| Quy tắc môi trường / tiện nghi | `utils/recommendation-rules.ts`, `utils/comfort-rules.ts` |
| Hành động theo ngữ cảnh | `utils/recommendations.ts` |
| Gọi API thời tiết | `services/live-weather.ts`, `services/weather/` |
| Dữ liệu tài khoản | `services/account.ts`, `services/supabase.ts` |
| Màu sắc/font | `theme.ts` |

Giữ các nhóm code liên quan trong cùng file. Import và destructuring ưu tiên một
dòng; danh sách dài chia theo nhóm, không bắt buộc mỗi tên một dòng. Cho phép
khoảng 180 ký tự cho danh sách/tham số, 220 cho import; object ngắn có thể gom
trong khoảng 120 ký tự. Không gộp nhiều thao tác khác nhau vào một dòng. Giữ
nguyên chuỗi giao diện, URL và HTML nhúng; không định dạng lại `types/database.ts`
vì đây là file được sinh tự động.

## Quy tắc bảo trì

- Dữ liệu API được kiểm tra/chuẩn hóa trong `services` trước khi đưa vào giao diện.
- Dùng hook và context hiện có; chỉ tạo thêm lớp hoặc file khi thật sự cần.
- Gợi ý dùng quy tắc và sở thích onboarding; không thu thập hoặc xếp hạng theo phản hồi.
- Chọn giờ cho đi bộ, chạy bộ, đi làm/đi học hoặc ra ngoài; lưu giờ, bật nhắc và bỏ giờ đã lưu.
- Nhắc lịch dùng hệ điều hành; kiểm tra thay đổi dự báo khi mở/quay lại app.
  Chưa có dịch vụ theo dõi nền và remote push.
- Giữ nguyên migration và kiểu database được sinh tự động.
- `artifacts/native-verification.zip` lưu 156 ảnh kiểm thử cũ;
  `artifacts/unused-assets.zip` lưu 57 tài nguyên không còn dùng và giấy phép.
  Có thể giải nén khi cần đối chiếu, không cần để hàng trăm file rời trong dự án.
- `node_modules`, `.expo`, `android`, `ios` là thư viện hoặc thư mục được công cụ sinh;
  không chỉnh tay để giảm số file. Expo tạo thư mục native khi cần build.

## Kiểm tra

```sh
npm run typecheck
npm test -- --silent
npm run test:mail
npx expo export --platform android --output-dir /tmp/outfit-android-export
```

Kiểm thử dùng dữ liệu giả lập, không yêu cầu backend thật. Với thay đổi UI, rà thêm
trên Android/iOS: chữ lớn, quyền vị trí, lỗi mạng và điều hướng.

## Tài liệu dự án

- [Tìm đúng file sửa giao diện/chức năng](docs/SUA-GIAO-DIEN.md).
- [Ôn bảo vệ và thứ tự đọc code](docs/ON-BAO-VE.md). Mỗi file trong `src` có
  chú thích tiếng Việt đầu file giải thích vai trò. Bắt đầu từ `app/_layout.tsx`,
  rồi theo `screens/home-screen.tsx` → `hooks/home.ts` → `services/live-weather.ts`
  → `utils/recommendation-engine.ts`. Phần chọn giờ nằm ở `utils/planning.ts`.
- [Sản phẩm](docs/PRODUCT.md) · [Kiến trúc](docs/ARCHITECTURE.md)
- [Tiến trình và việc còn lại](docs/PROGRESS.md) · [Quyết định](docs/DECISIONS.md)
- [Thiết kế](docs/DESIGN.md) · [Dữ liệu thời tiết](docs/WEATHER.md)
- [Database](docs/DATABASE.md)
