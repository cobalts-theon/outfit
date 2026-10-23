# Ôn bảo vệ đồ án — học theo luồng, mở đúng file

Đối chiếu code ngày **23/10/2026**, sau khi tách `src/css` và gom gọn cách viết.
Mục tiêu: nói được ứng dụng làm gì, giải thích được các luồng chính và mở đúng
hàm khi thầy hỏi. Không cần học thuộc cả 81 file.

**Cách học mỗi mục:** đọc câu trả lời mẫu → mở file → tìm hàm bằng Ctrl + F →
đóng tài liệu và tự nói lại trong 30–60 giây. Trong code đã có comment `//` tiếng Việt.

**Mở nhanh phần cần học:** [Thời tiết](#weather) · [Rule Engine](#rules) ·
[Chọn giờ](#planning) · [Supabase](#backend) · [Gmail từng file](#email) ·
[Chỗ sửa UI/chức năng](#edit) · [Câu hỏi phản biện](#questions) · [Lịch ôn](#schedule).

## 1. Nếu chỉ còn 10 phút: nhớ tám ý này

| Cần nhớ | Câu trả lời ngắn |
| --- | --- |
| Đề tài làm gì? | Chuyển thời tiết và môi trường thành gợi ý sinh hoạt có bằng chứng. |
| App viết bằng gì? | React Native, Expo, TypeScript; Expo Router điều hướng. |
| Thời tiết lấy ở đâu? | Open-Meteo: dự báo, môi trường và tìm địa điểm. |
| Có tự dự báo thời tiết không? | Không. App sử dụng dự báo từ nhà cung cấp rồi đánh giá bằng quy tắc. |
| Gợi ý tạo thế nào? | Rule Engine chạy quy tắc, gộp hành động trùng và xếp ưu tiên. |
| Supabase làm gì? | Xác thực, lưu dữ liệu cá nhân và Storage ảnh đại diện. |
| Gmail làm gì? | Gửi thư OTP; Supabase tạo và xác minh mã. |
| Muốn sửa UI ở đâu? | `src/css/`; chức năng ở component, hook, service và utils tương ứng. |

**Sơ đồ cần tự vẽ được:**

```text
Vị trí → Open-Meteo → kiểm tra JSON → chuẩn hóa dữ liệu
                                            ↓
                                      bộ quy tắc
                                            ↓
                          lời khuyên + lý do + hành động

Tài khoản / giờ đã lưu → Supabase
Email OTP             → Supabase Auth → Edge Function → Gmail API
Nhắc lịch             → hệ điều hành trên điện thoại
```

## 2. Lời giới thiệu khoảng một phút

> Đề tài của em là hệ thống dự báo thời tiết và hỗ trợ sức khỏe người dùng.
> Ứng dụng sử dụng thời tiết, nhiệt độ cảm nhận, mưa, UV và chất lượng không khí
> tại địa điểm được chọn để đưa ra gợi ý sinh hoạt và chuẩn bị khi ra ngoài.
> Người dùng cũng có thể đánh giá giờ cho hoạt động, đăng nhập để lưu và đồng bộ.
> Ứng dụng dùng React Native với Expo, Open-Meteo cung cấp dữ liệu, Supabase
> phục vụ tài khoản và lưu trữ. Phần xử lý chính là bộ quy tắc có thể giải thích:
> mỗi lời khuyên đi kèm dữ liệu kích hoạt và được xếp theo mức độ ưu tiên.
> Ứng dụng có kiểm tra dữ liệu thiếu, dữ liệu cũ và thời gian dự báo bao phủ hoạt động.

Nếu làm nhóm, nói rõ phần bạn trực tiếp thực hiện. Phân biệt phần tự xây dựng
với thư viện và dịch vụ đã sử dụng.

## 3. Nhìn folder là biết chỗ tìm

| Folder/file | Hiểu đơn giản | Ví dụ |
| --- | --- | --- |
| `src/app` | Đường dẫn mở màn hình | `/`, `/forecast`, `/plans` |
| `src/screens` | Bố cục của cả màn hình | Home, dự báo, chọn giờ |
| `src/components` | Các khối UI ghép vào màn hình | Form đăng nhập, thẻ lời khuyên |
| `src/css` | Style riêng của từng phần | Màu, font, khoảng cách, hiệu ứng |
| `src/hooks` | Nối dữ liệu và thao tác với màn hình | `useHomeModel`, `usePlansScreen` |
| `src/context` | Trạng thái dùng chung | Tài khoản, vị trí, thông báo |
| `src/services` | Gọi API, backend và chức năng thiết bị | Tải thời tiết, lưu giờ, GPS |
| `src/utils` | Quy tắc và tính toán | Gợi ý, đánh giá hoạt động |
| `src/types` | Khai báo cấu trúc dữ liệu | `CurrentWeather`, kiểu database |
| `src/constants` | Dữ liệu mẫu | Fixture thời tiết, kịch bản Home |
| `src/theme.ts` | Giá trị giao diện dùng chung | Bảng màu, font, khoảng cách |
| `supabase/functions/gmail-otp` | Server gửi thư | Kiểm tra webhook và gọi Gmail API |
| `supabase/migrations` | Thay đổi cấu trúc/quyền database | Bảng, ràng buộc, RLS |
| `tests` | Kiểm thử tự động | Đầu vào → kết quả mong đợi |

**Ba câu phân biệt:** screen là cả trang; component là một khối trong trang;
hook chuẩn bị dữ liệu/thao tác để trang sử dụng.

<a id="weather"></a>

## 4. Luồng A — mở app và lấy thời tiết

**Câu cần trả lời:** “Từ lúc mở app đến lúc thấy thời tiết, code chạy qua đâu?”

| Bước | Mở file | Tìm hàm / xem gì |
| --- | --- | --- |
| 1 | [app/_layout.tsx](../src/app/_layout.tsx) | `RootLayout`: chờ bootstrap rồi gắn providers/navigator. |
| 2 | [context/app.tsx](../src/context/app.tsx) | `AppProviders`, `RootNavigator`: context dùng chung và điều hướng. |
| 3 | [screens/home-screen.tsx](../src/screens/home-screen.tsx) | `HomeScreen`: lấy model rồi ghép các component. |
| 4 | [context/location.tsx](../src/context/location.tsx) | `LocationCapabilityProvider`: quản lý quyền và địa điểm được chọn. |
| 5 | [services/location.ts](../src/services/location.ts) | `acquireDevicePosition`, `searchOpenMeteoLocations`: lấy GPS hoặc tìm thủ công. |
| 6 | [hooks/home.ts](../src/hooks/home.ts) | `useHomeModel`: lấy vị trí, gọi query và tạo dữ liệu cho Home. |
| 7 | [services/live-weather.ts](../src/services/live-weather.ts) | `useLiveCurrentWeather`, `loadLiveCurrentWeather`: tải và tổng hợp kết quả. |
| 8 | [services/weather/request.ts](../src/services/weather/request.ts) | `buildOpenMeteoLiveWeatherForecastUrl`: URL và danh sách chỉ số cần lấy. |
| 9 | [services/weather/client.ts](../src/services/weather/client.ts) | `fetchOpenMeteoLiveWeatherForecast`, `fetchOpenMeteoCurrentAirQuality`: gọi HTTP. |
| 10 | [services/weather/responses.ts](../src/services/weather/responses.ts) | Parser kiểm tra cấu trúc JSON nhận được. |
| 11 | [services/weather/current-adapter.ts](../src/services/weather/current-adapter.ts) | `adaptOpenMeteoCurrentWeather`: chuẩn hóa thời tiết hiện tại. |
| 12 | [services/weather/adapters.ts](../src/services/weather/adapters.ts) | Chuẩn hóa dự báo giờ/ngày. AQI/UV được chuẩn hóa ở `client.ts`. |

**Ba endpoint đang dùng trong code:**

```text
Thời tiết:    https://api.open-meteo.com/v1/forecast
Môi trường:   https://air-quality-api.open-meteo.com/v1/air-quality
Địa điểm:     https://geocoding-api.open-meteo.com/v1/search
```

**Từ khóa cần hiểu:**

- **Parser:** JSON có đúng kiểu và cấu trúc mong đợi không?
- **Adapter:** đổi dữ liệu nhà cung cấp sang cấu trúc mà app hiểu.
- **Domain model:** cấu trúc nội bộ như `CurrentWeather` trong [types/weather.ts](../src/types/weather.ts).

**Câu nói mẫu:**

> App lấy tọa độ hoặc địa điểm chọn thủ công, gọi Open-Meteo, kiểm tra phản hồi
> rồi chuẩn hóa sang kiểu dữ liệu nội bộ. Màn hình sử dụng kiểu nội bộ nên không
> cần tự hiểu mã thời tiết riêng của nhà cung cấp.

**Nếu thầy hỏi lỗi mạng:** forecast và môi trường được gọi bằng
`Promise.allSettled`. Forecast chính lỗi thì báo lỗi; nguồn AQI lỗi vẫn có thể
trả phần thời tiết dùng được với trạng thái `partial`.

**Hai mốc thời gian:** query có `staleTime` và chu kỳ tải lại **10 phút** khi app
hoạt động. Home coi dữ liệu cũ sau **30 phút kể từ lần query cập nhật cache**,
ngừng tạo hành động/thông báo từ evaluation đó. Đây không phải cam kết số liệu
của nhà cung cấp luôn mới đúng 10 phút.

**Tự kiểm tra:** từ chối GPS có dùng được không? → Có thể chọn địa điểm thủ công.
Thiếu AQI có nghĩa là không khí tốt không? → Không, phải ghi nhận dữ liệu thiếu.

<a id="rules"></a>

## 5. Luồng B — bộ quy tắc tạo lời khuyên

Đây là phần nên học kỹ nhất. **Quy tắc đang nằm trong code TypeScript.**

| File | Hàm cần tìm | Vai trò |
| --- | --- | --- |
| [recommendation-rules.ts](../src/utils/recommendation-rules.ts) | `evaluateInitialRecommendationRules`, `uvRule`, `usAqiRule`, `currentRainRule` | Quy tắc môi trường, mưa, cảnh báo và cơ hội ngoài trời. |
| [comfort-rules.ts](../src/utils/comfort-rules.ts) | `heatRule`, `everydayHydrationRule`, `warmClothingRule` | Quy tắc nhiệt độ, độ ẩm, tiện nghi và trang phục. |
| [recommendation-engine.ts](../src/utils/recommendation-engine.ts) | `evaluateRecommendations`, `mergeDuplicateActions`, `compareCandidates` | Kiểm tra dữ liệu thiếu, gộp trùng, xếp ưu tiên. |
| [recommendations.ts](../src/utils/recommendations.ts) | `createDailyActions`, `personalizeDailyActions`, `visibleDailyActions` | Chuyển thành hành động theo ngữ cảnh và chọn phần xem trước. |
| [hooks/home.ts](../src/hooks/home.ts) | `createLiveRecommendationPresentation` | Gọi engine rồi chuẩn bị nội dung cho Home. |

**Thứ tự xử lý:**

```text
Số đo → chạy các quy tắc → danh sách ứng viên
→ gộp cùng actionKey → xếp severity → xếp priority
→ tạo hành động theo ngữ cảnh → hiển thị cùng bằng chứng
```

| Trường | Cần hiểu |
| --- | --- |
| `ruleId` | Quy tắc nào tạo ra gợi ý? |
| `actionKey` | Hành động gì? Dùng để nhận diện và gộp trùng. |
| `severity` | Mức độ: danger > warning > attention > info. |
| `priority` | Cùng mức độ thì ưu tiên số lớn hơn. |
| `triggers` | Những chỉ số làm quy tắc khớp. |
| `matchedRuleIds` | Các quy tắc cùng đóng góp cho hành động đã gộp. |

Nếu severity và priority bằng nhau, engine so `ruleId` để giữ thứ tự ổn định.

### Ví dụ để tự giải thích

Giả sử dữ liệu đã chuẩn hóa có: **ban ngày, cảm nhận 36°C, UV 8 thuộc very_high,
US AQI 151 thuộc unhealthy**. Chỉ xét ba quy tắc sau:

| Quy tắc | actionKey | severity / priority |
| --- | --- | --- |
| AQI xấu | `air-quality-exposure` | warning / 90 |
| UV rất cao | `sun-heat-protection` | warning / 85 |
| Nóng từ 35°C | `sun-heat-protection` | attention / 65 |

Hai gợi ý UV/nóng cùng `actionKey`, nên gộp thành một hành động và giữ bằng chứng
của cả hai. Gợi ý AQI đứng trước vì cùng mức warning nhưng priority 90 cao hơn 85.
Các quy tắc khác vẫn có thể tạo thêm lời khuyên tùy toàn bộ đầu vào.

**Câu nói mẫu:**

> Bộ quy tắc đánh giá các chỉ số hiện có để tạo gợi ý. Những quy tắc dẫn tới cùng
> hành động được gộp, giữ lại bằng chứng. Sau đó hệ thống ưu tiên mức độ nguy hiểm,
> rồi đến priority, để lời khuyên quan trọng xuất hiện trước.

**Đừng nhầm:** engine mặc định giới hạn 3, nhưng Home gọi với `maxRecommendations: 100`
để xét đủ ứng viên. Phần xem trước giữ ba dòng đầu và thêm các dòng urgent,
warning hoặc danger ngoài ba dòng đó.
Không kết luận rằng toàn hệ thống chỉ xét ba quy tắc.

**Tự kiểm tra:** tại sao cần gộp? → Tránh lặp cùng hành động khi nhiều chỉ số cùng kích hoạt.
Có tự học từ phản hồi không? → Không, đây là bộ quy tắc xác định.

<a id="planning"></a>

## 6. Luồng C — chọn giờ hoạt động và lưu lại

**Câu cần trả lời:** “Vì sao app cho rằng giờ này phù hợp hoặc nên tránh?”

```text
Chọn hoạt động/ngày/thời lượng
→ lấy dự báo giờ và AQI giờ
→ kiểm tra dữ liệu phủ đủ thời gian
→ xét điều kiện bất lợi trong cả khoảng
→ trả đánh giá và đồ cần chuẩn bị
→ đăng nhập để lưu giờ và bật nhắc
```

| File | Hàm cần tìm | Vai trò |
| --- | --- | --- |
| [screens/plans-screen.tsx](../src/screens/plans-screen.tsx) | `PlansScreen` | Giao diện chọn hoạt động, ngày và giờ. |
| [hooks/plans.tsx](../src/hooks/plans.tsx) | `usePlansScreen`, `useActivityPlanner`, `usePlanningAirQuality` | Nối lựa chọn với dự báo, đánh giá và thao tác lưu. |
| [services/live-weather.ts](../src/services/live-weather.ts) | `createPlanningHours` | Tạo dữ liệu đầu vào `PlanningHour[]`. |
| [utils/planning.ts](../src/utils/planning.ts) | `assessActivity` | Đánh giá một hoạt động tại một giờ cụ thể. |
| Cùng file trên | `activityCandidates` | Thử giờ cách nhau 30 phút, xếp điểm thấp trước, chọn tối đa ba khoảng không chồng nhau. |
| Cùng file trên | `assessDeparture` | Đánh giá đúng giờ đi làm/đi học đã chọn, không tự thay giờ khác. |
| [services/plans.ts](../src/services/plans.ts) | `saveActivityPlan`, `listActivityPlans`, `changeActivityPlan` | Lưu, đọc, cập nhật hoặc xóa hoạt động. |

**Bốn bước trong `assessActivity`:**

1. Giờ phải ở tương lai; thời lượng là số phút nguyên từ 1 đến 1440; dữ liệu tải không quá cũ.
2. Dự báo theo giờ phải phủ liên tục toàn bộ khoảng hoạt động.
3. Kiểm tra chỉ số bắt buộc; hoạt động phơi nhiễm ngoài trời cần đủ AQI/UV.
4. Lấy các giá trị bất lợi trong khoảng, xác định rủi ro, trạng thái và điểm số.

| Trạng thái | Nghĩa |
| --- | --- |
| `unknown` | Chưa đủ căn cứ hoặc đầu vào không hợp lệ. |
| `suitable` | Phù hợp theo các điều kiện đang xét. |
| `caution` | Có điểm cần lưu ý hoặc dữ liệu môi trường còn thiếu trong ngữ cảnh được phép đánh giá. |
| `avoid` | Nên tránh theo quy tắc hiện tại. |

Điểm thấp được ưu tiên hơn khi xếp ứng viên; điểm kết hợp trạng thái, mưa,
nhiệt độ cảm nhận, gió, UV và AQI. Đây là hàm đánh giá do dự án thiết kế,
không phải xác suất an toàn hay bảo đảm tối ưu tuyệt đối.

**Ví dụ:** đi bộ từ 17:30 đến 18:30 phải xét cả phần dự báo chứa 17:30 và phần
chứa 18:00. Nếu thiếu phần sau, không lấy riêng giờ bắt đầu để kết luận phù hợp.

**Câu nói mẫu:**

> Hệ thống đánh giá toàn bộ khoảng hoạt động, kiểm tra độ mới và độ phủ dự báo,
> rồi xét các giá trị bất lợi. Các khung giờ được so sánh bằng điểm số và loại
> kết quả chưa đủ dữ liệu theo điều kiện chọn. Đi làm/đi học giữ đúng giờ xuất phát.

**Lưu ý khi mở code:** [walking-planner.ts](../src/utils/walking-planner.ts) giữ
bộ chính sách đi bộ `walking-v1` và hàm thời gian dùng chung. Luồng hoạt động
hiện tại cần ưu tiên giải thích `assessActivity` trong `planning.ts`.

<a id="backend"></a>

## 7. Luồng D — Supabase, đăng nhập và dữ liệu cá nhân

| File | Chịu trách nhiệm |
| --- | --- |
| [.env.example](../.env.example) | Mẫu tên biến URL và publishable key cho app. |
| [services/supabase.ts](../src/services/supabase.ts) | Kiểm tra cấu hình, tạo client và lưu phiên đăng nhập. |
| [context/auth.tsx](../src/context/auth.tsx) | `AuthProvider`, `signIn`, `signUp`, `signOut`; theo dõi phiên. |
| [hooks/account.ts](../src/hooks/account.ts) | `useAccountModel`, `submit`; kiểm tra form và cập nhật trạng thái UI. |
| [components/account.tsx](../src/components/account.tsx) | Form tài khoản và hồ sơ. |
| [services/account.ts](../src/services/account.ts) | Hồ sơ, ảnh đại diện, sở thích và các API OTP. |

**Hai biến của app:**

```env
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```

| Nơi lưu | Dữ liệu liên quan |
| --- | --- |
| Supabase Auth | Tài khoản, mật khẩu do dịch vụ quản lý, phiên và metadata sở thích. |
| `profiles` | Tên và đường dẫn ảnh đại diện. |
| `saved_locations` | Địa điểm riêng của người dùng. |
| `activity_plans` | Hoạt động, thời gian và bằng chứng tóm tắt đã lưu. |
| `notification_preferences` | Tùy chọn thông báo của tài khoản. |
| Storage `profile-images` | File ảnh đại diện riêng tư. |

**Bảo vệ dữ liệu thế nào?** Client dùng public key kèm phiên người dùng. RLS ở
database giới hạn dữ liệu theo chủ sở hữu, ví dụ `auth.uid() = user_id`.
Ẩn nút hoặc thêm `.eq('user_id', ...)` trong app không thay thế được RLS.
Xem ví dụ tại [migration hoạt động](../supabase/migrations/20260906041159_add_activity_plans_and_walking_policy.sql).

**Câu nói mẫu:**

> Supabase Auth quản lý danh tính và phiên. Dữ liệu cá nhân được lưu theo người
> dùng, quyền truy cập được kiểm soát ở database bằng RLS. App dùng publishable
> key; khóa quản trị và thông tin gửi Gmail nằm phía server.

**Hai điều dễ nhầm:** có bảng `recommendation_rules` không có nghĩa Home đang
đọc quy tắc từ bảng đó; engine hiện chạy quy tắc TypeScript. Dữ liệu thời tiết
được quản lý qua query/cache, không mặc định lưu toàn bộ JSON vào Supabase.

<a id="email"></a>

## 8. Luồng E — Gmail và OTP, đi qua từng file

**Nhớ trước:** Gmail gửi thư; Supabase tạo/xác minh mã. Google OAuth dùng cho
hộp thư gửi, không phải chức năng người dùng đăng nhập bằng Google.

```text
account.tsx → hooks/account.ts → context/auth.tsx → Supabase tạo OTP
→ index.ts → handler.ts → gmail.ts → người dùng nhận thư
→ email-otp.tsx → services/account.ts → Supabase xác minh
```

| Bước | File / hàm | Việc xảy ra |
| --- | --- | --- |
| 1 | [components/account.tsx](../src/components/account.tsx), nút đăng ký | Gọi `submit()`. |
| 2 | [hooks/account.ts](../src/hooks/account.ts), `submit()` | Kiểm tra form, gọi `signUp()`; cần xác nhận thì bật `otpFlow`. |
| 3 | [context/auth.tsx](../src/context/auth.tsx), `signUp()` | Gọi `supabase.auth.signUp()`. Supabase tạo mã và gọi Send Email Hook. |
| 4 | [gmail-otp/index.ts](../supabase/functions/gmail-otp/index.ts) | Đọc secrets, khởi tạo sender và nhận HTTP qua `Deno.serve`. |
| 5 | [gmail-otp/handler.ts](../supabase/functions/gmail-otp/handler.ts), `createGmailOtpHandler()` | Kiểm tra chữ ký webhook, đọc người nhận/mã rồi tạo thư bằng `messages()`/`message()`. |
| 6 | [gmail-otp/gmail.ts](../supabase/functions/gmail-otp/gmail.ts), `createGmailSender()` | Lấy token, đóng gói email và gửi bằng Gmail API. |
| 7 | [components/email-otp.tsx](../src/components/email-otp.tsx), `verify()` | Nhận sáu số người dùng nhập rồi gọi hàm xác minh tương ứng. |
| 8 | [services/account.ts](../src/services/account.ts), `verifyEmailOtp()` | Gọi `auth.verifyOtp()`; Supabase kiểm tra mã và trả phiên nếu thành công. |

**Ba hàm trong `gmail.ts`:**

- `accessToken()`: dùng token cache còn hạn hoặc đổi Refresh Token lấy token mới.
- `rawMessage()`: đóng gói thư dạng MIME, hỗ trợ nội dung tiếng Việt.
- `send()`: gọi Gmail API gửi thư đã đóng gói.

**Gửi lại mã:** `email-otp.tsx/send()` → `requestEmailOtp()` →
`auth.resend({ type: 'signup', email })` → lại qua hook và Gmail.
Đăng ký lần đầu gửi qua `auth.signUp()`, không phải qua `resend()`.

**Quên mật khẩu:** `createPasswordRecovery()` tạo client không lưu phiên chung.
`send()` gọi `resetPasswordForEmail()`; `verify()` xác minh mã recovery;
`updatePassword()` đổi mật khẩu sau khi xác minh. Người dùng dùng mật khẩu mới
để đăng nhập, không thay thế phiên chính bằng phiên khôi phục.

**Cấu hình ở đâu?** File riêng `.env.supabase-management` cung cấp Gmail,
Google Client ID/Secret, Refresh Token và khóa ký hook. `SUPABASE_ACCESS_TOKEN`
phục vụ script quản trị. Các giá trị bí mật không nằm trong biến công khai của app.
[configure-email-otp.mjs](../scripts/configure-email-otp.mjs) lưu secrets và bật hook.
Xem từng bước cấu hình tại [EMAIL_OTP.md](EMAIL_OTP.md).

**Câu nói mẫu:**

> Supabase tạo OTP rồi gọi Edge Function bằng webhook có chữ ký. Hàm kiểm tra
> yêu cầu, tạo nội dung thư và dùng Google OAuth gọi Gmail API. Khi người dùng
> nhập mã, app gửi lại Supabase để xác minh; Gmail không kiểm tra OTP.

**Tự kiểm tra:** mail đã được API chấp nhận có chắc nằm trong inbox không?
→ Chưa chắc; phải kiểm tra inbox/Spam và thử nhập mã để xác nhận toàn luồng.

## 9. Luồng F — thông báo và nhắc giờ đã lưu

| File | Hàm / nhiệm vụ |
| --- | --- |
| [utils/recommendations.ts](../src/utils/recommendations.ts) | `createRecommendationNotificationPlan`: tạo sự kiện thông báo có căn cứ thời tiết. |
| [context/notifications.tsx](../src/context/notifications.tsx) | Quản lý bật/tắt, quyền và phối hợp đồng bộ. |
| [services/notifications.ts](../src/services/notifications.ts) | `syncRecommendationNotifications`: đặt/hủy lịch; dùng signature tránh gửi lặp. |
| [services/plans.ts](../src/services/plans.ts) | `syncPlanNotification`: nhắc hoạt động trước 15 phút; nếu đã vào khoảng nhắc thì xử lý gửi ngay theo điều kiện. |
| [hooks/plans.tsx](../src/hooks/plans.tsx) | `PlanMonitor`: kiểm tra lại các giờ đã lưu khi app hoạt động/quay lại. |
| [context/app.tsx](../src/context/app.tsx) | `openNotificationDestination`: bấm thông báo thì mở đúng màn hình. |

**Câu nói mẫu:**

> App đặt lịch thông báo cục bộ cho hệ điều hành. Các thay đổi dự báo được kiểm
> tra khi app hoạt động hoặc quay lại. Hiện chưa có server giám sát liên tục và
> gửi remote push về mọi thay đổi lúc app đóng.

Đóng app vẫn có thể nhận lịch cục bộ đã đặt, tùy quyền và cơ chế hệ điều hành.
Điều đó khác với việc app tự tải dự báo mới liên tục trong nền.

<a id="edit"></a>

## 10. Khi thầy yêu cầu sửa UI hoặc chức năng

Trong VS Code, giữ **Ctrl + click** (macOS: Cmd + click) vào tên hàm/style hoặc
nhấn **F12** để mở định nghĩa. Dùng **Ctrl + F** tìm hàm trong file;
**Ctrl + Shift + F** tìm toàn dự án.

| Thầy yêu cầu | Mở đúng chỗ |
| --- | --- |
| Đổi màu nút dùng chung | [css/components/controls.styles.ts](../src/css/components/controls.styles.ts), `neoButtonStyles.button` |
| Đổi font/khoảng cách Home | [css/screens/home-screen.styles.ts](../src/css/screens/home-screen.styles.ts) |
| Đổi màu dòng lời khuyên | [css/components/home-advice.styles.ts](../src/css/components/home-advice.styles.ts), `actionSurfaceStyle` |
| Đổi UI đăng nhập/OTP | [account.styles.ts](../src/css/components/account.styles.ts), [email-otp.styles.ts](../src/css/components/email-otp.styles.ts) |
| Đổi bảng màu/font toàn app | [theme.ts](../src/theme.ts) |
| Đổi ngưỡng nóng hoặc lời khuyên trang phục | [comfort-rules.ts](../src/utils/comfort-rules.ts) |
| Đổi điều kiện UV, AQI, mưa | [recommendation-rules.ts](../src/utils/recommendation-rules.ts) |
| Đổi cách xếp ưu tiên | [recommendation-engine.ts](../src/utils/recommendation-engine.ts), `compareCandidates` |
| Đổi cách đánh giá giờ hoạt động | [planning.ts](../src/utils/planning.ts), `assessActivity` |
| Đổi chu kỳ tải lại thời tiết | [live-weather.ts](../src/services/live-weather.ts), `LIVE_CURRENT_WEATHER_STALE_TIME_MS` |
| Đổi nội dung thư OTP | [gmail-otp/handler.ts](../supabase/functions/gmail-otp/handler.ts), `titles`, `message` |

Sửa code Edge Function trên máy chưa tự cập nhật server: cần triển khai lại hàm
để thay đổi gửi email có hiệu lực. Chi tiết toàn bộ UI xem [SUA-GIAO-DIEN.md](SUA-GIAO-DIEN.md).

## 11. Các kiểu viết cần đọc hiểu khi mở code

| Code / khái niệm | Hiểu đơn giản |
| --- | --- |
| `const { email, submit } = model` | Lấy thuộc tính từ `model`; tương đương đọc `model.email`, `model.submit`. |
| `value?.name` | Chỉ đọc `name` nếu `value` không null/undefined. |
| `value ?? fallback` | Dùng giá trị dự phòng khi `value` null/undefined. |
| `{ ...item, status: 'planned' }` | Sao chép thuộc tính rồi đặt lại `status`. Đây là sao chép nông. |
| `.map(...)` | Biến từng phần tử thành giá trị mới. |
| `.filter(...)` | Giữ những phần tử thỏa điều kiện. |
| `.sort(...)` | Sắp xếp theo hàm so sánh; lưu ý nó sửa mảng đang gọi. |
| `async` / `await` | Viết luồng chờ tác vụ bất đồng bộ như gọi API. |
| `useState` | Lưu trạng thái cục bộ để UI cập nhật khi thay đổi. |
| `useEffect` | Đồng bộ với tác vụ bên ngoài; dọn timer/listener ở hàm cleanup. |
| `useContext` / React `use(context)` | Đọc trạng thái dùng chung từ Provider. Dự án dùng `use(context)`. |
| `useQuery` | Lấy dữ liệu, quản lý cache và trạng thái tải/lỗi. |
| `useMutation` | Quản lý thao tác thay đổi dữ liệu như lưu/xóa. |
| `useCallback` | Giữ tham chiếu hàm khi dependencies chưa đổi. |
| `useMemo` | Tái sử dụng giá trị đã tính khi dependencies chưa đổi. |
| `interface` / `type` | Mô tả cấu trúc dữ liệu, không tự kiểm tra JSON lúc chạy. |
| Props | Dữ liệu/hàm component cha truyền cho component con. |
| `onPress={() => void submit()}` | Chỉ gọi submit lúc bấm; `void` bỏ giá trị Promise trả về. |

Nếu không hiểu một hàm, ghi bốn dòng: **nhận gì → kiểm tra gì → xử lý gì → trả gì**.
Đừng chỉ đọc tên rồi đoán; xem cả nhánh lỗi và nơi gọi.

<a id="questions"></a>

## 12. Tự trả lời câu hỏi phản biện

Đọc câu hỏi, che cột trả lời, tự nói trước rồi mới đối chiếu.

| Câu hỏi | Câu trả lời cần đạt |
| --- | --- |
| Khác app thời tiết thông thường ở đâu? | Dịch số đo thành hành động có lý do; hỗ trợ đánh giá giờ hoạt động. |
| Có dùng AI không? | Bản hiện tại dùng quy tắc xác định; không huấn luyện mô hình hay chatbot. |
| Vì sao chọn cách dùng quy tắc? | Dễ giải thích, kiểm thử và điều chỉnh; phụ thuộc chất lượng/ngưỡng thiết kế. |
| Vì sao có parser dù đã dùng TypeScript? | JSON ngoài mạng có thể sai khi chạy; TypeScript không tự xác minh dữ liệu đó. |
| Vì sao tách adapter? | Giữ UI/logic độc lập với cấu trúc phản hồi của nhà cung cấp. |
| Vì sao dùng Promise.allSettled? | Một nguồn phụ lỗi vẫn có thể giữ phần dữ liệu dùng được. |
| AQI không có thì sao? | Ghi nhận thiếu; không kết luận không khí tốt. Hoạt động phơi nhiễm cần đủ đầu vào. |
| Dữ liệu cũ xử lý thế nào? | Có tải lại/cache; Home và đánh giá hoạt động kiểm tra mốc cũ để hạn chế kết luận. |
| Tại sao lời khuyên này đứng đầu? | Chỉ severity, priority và bằng chứng; mở `compareCandidates`. |
| Cùng hành động từ hai quy tắc thì sao? | Gộp theo actionKey, giữ bằng chứng và các rule đã khớp. |
| Lập giờ có tính cả tuyến đường không? | Đánh giá tại địa điểm đã chọn, chưa mô hình hóa toàn tuyến di chuyển. |
| Người khác sửa được dữ liệu của tôi không? | Quyền được giới hạn bằng RLS theo tài khoản; không chỉ kiểm tra trên UI. |
| Gmail có tạo OTP không? | Không. Supabase tạo/xác minh; Gmail API gửi thư qua Edge Function. |
| Vì sao không đặt Gmail secret trong app? | App có thể bị trích xuất; bí mật gửi thư thuộc server. |
| App đóng có biết thời tiết đổi ngay không? | Chưa có giám sát server/remote push cho mọi thay đổi; lịch cục bộ đã đặt là luồng khác. |
| Đánh giá độ chính xác của gợi ý thế nào? | Có test hành vi theo quy tắc; chưa được suy ra thành độ chính xác khí tượng hay hiệu quả lâm sàng. |

**Các giới hạn phải nói đúng:** dữ liệu thực tế dùng Open-Meteo; Web Admin riêng
đang hoãn, vận hành qua Supabase Dashboard; gợi ý là hỗ trợ sinh hoạt, không chẩn
đoán bệnh; iOS chưa được xác minh đầy đủ. Không nhận phần việc chưa làm.

**Về dữ liệu mẫu:** `constants/weather-fixtures.ts` và `demo-weather.ts` có dữ
liệu trình bày/kiểm thử. Home có fallback nhưng hành động trực tiếp được tạo từ
live evaluation; không gọi số mẫu là số đo thật.

<a id="schedule"></a>

## 13. Hai giờ ôn tập và demo

| Thời gian | Học gì | Điều kiện để chuyển mục |
| --- | --- | --- |
| 0–15 phút | Mục 1–3, mở app | Nói được một phút giới thiệu và sơ đồ. |
| 15–40 phút | Luồng thời tiết | Tự mở được Home → hook → service → parser/adapter. |
| 40–65 phút | Rule Engine | Giải thích được ví dụ nóng + UV + AQI, gộp và ưu tiên. |
| 65–85 phút | Chọn giờ, lưu, thông báo | Phân biệt đánh giá một khoảng với đánh giá giờ khởi hành. |
| 85–105 phút | Supabase và Gmail | Kể được từng file gửi/xác minh OTP; phân biệt public key và secret. |
| 105–120 phút | Câu hỏi và demo | Nói không nhìn tài liệu, mở đúng hàm khi được yêu cầu. |

Nếu có thêm thời gian, đọc các test dưới đây và luyện sửa một style/ngưỡng trên
bản làm việc rồi hoàn tác. Không đổi tài khoản gửi thư hoặc cấu hình server sát giờ demo.

**Demo gợi ý khoảng 5 phút:**

1. Home: chỉ vị trí và tình trạng dữ liệu.
2. Chọn một lời khuyên, mở bằng chứng và giải thích vì sao xuất hiện.
3. Mở dự báo, liên hệ thay đổi sắp tới với hành động cần chuẩn bị.
4. Chọn hoạt động/ngày/giờ, giải thích đánh giá và dữ liệu còn thiếu nếu có.
5. Dùng tài khoản sẵn có để lưu giờ và bật nhắc nếu quyền/mạng cho phép.
6. Mở `recommendation-engine.ts`, chỉ chỗ gộp trùng và xếp ưu tiên.

Chuẩn bị ảnh màn hình dự phòng nếu mạng/API trục trặc và nói rõ đó là ảnh chụp.
OTP nên dùng email thử của mình; không đưa thông tin bí mật lên màn hình chia sẻ.

## 14. Bằng chứng kiểm thử và tự chấm cuối buổi

| Test nên mở | Giúp chứng minh gì? |
| --- | --- |
| [recommendation-engine.test.ts](../tests/recommendation-engine.test.ts) | Ngưỡng UV/AQI, thứ tự, gộp trùng và dữ liệu thiếu. |
| [activity-advisor.test.ts](../tests/activity-advisor.test.ts) | Đánh giá hoạt động, rủi ro và tình huống biên. |
| [live-current-weather.test.ts](../tests/live-current-weather.test.ts) | Tải thời tiết và lỗi từng nguồn. |
| [email-otp-repository.test.ts](../tests/email-otp-repository.test.ts) | Yêu cầu/xác minh OTP phía app. |
| [gmail-otp.test.mjs](../tests/gmail-otp.test.mjs) | Xử lý thư OTP và webhook phía server. |
| [plan-notifications.test.ts](../tests/plan-notifications.test.ts) | Cách lên lịch nhắc hoạt động. |

Trong phiên làm việc đã ghi nhận 357 test app đạt, Android/web export đạt;
sau đợt gom định dạng đã kiểm tra TypeScript và đối chiếu cấu trúc code không đổi.
Đó không phải bằng chứng đã xác minh mọi tình huống trên thiết bị hoặc email
vừa gửi đến inbox. Không tự đưa ra số phần trăm độ chính xác chưa đo.

Khi cần kiểm tra lại từ thư mục `weather`:

```sh
npm run typecheck
npm test -- --silent
npm run test:mail
```

**Tự chấm:** mỗi câu làm được 1 điểm; mục tiêu ít nhất 8/10 và biết mở code để bổ sung.

- [ ] Nói được đề tài trong một phút.
- [ ] Vẽ được vị trí → API → chuẩn hóa → quy tắc → UI.
- [ ] Mở đúng `useHomeModel` và `loadLiveCurrentWeather`.
- [ ] Giải thích parser khác adapter thế nào.
- [ ] Giải thích gộp actionKey và thứ tự severity/priority.
- [ ] Giải thích dữ liệu thiếu/cũ và độ phủ hoạt động.
- [ ] Kể đúng Supabase → webhook → Gmail → xác minh OTP.
- [ ] Chỉ đúng folder CSS và sửa đúng style khi được hỏi.
- [ ] Nói được RLS và phạm vi thông báo hiện tại.
- [ ] Nêu được hai giới hạn thật của dự án và phần mình trực tiếp làm.

Nếu quên một điều kiện, nói: **“Em xin mở hàm xử lý để giải thích chính xác.”**
Sau đó chỉ đầu vào, nhánh kiểm tra và kết quả trả về.
