# Email OTP qua Gmail API và Google Cloud OAuth

Supabase Auth tạo/xác minh OTP → HTTP Send Email Hook → Edge Function `gmail-otp`
→ Gmail API gửi thư bằng Gmail cá nhân. Email chứa mã số, không có link xác nhận.
App giữ nguyên UI, API đăng ký, gửi lại mã và khôi phục mật khẩu. Không cấu hình
SMTP Supabase; không cần tài khoản Google Workspace hay tên miền doanh nghiệp.

## Trạng thái

Project `xmubbpkaezlgtvxaxofg` dùng Free. Function Gmail API đã triển khai bản 3.
Khóa ký webhook đã có ở server. Google OAuth refresh và signed connection probe
đã thành công; Send Email Hook **đã bật** và đọc lại xác nhận đúng endpoint.
Không sửa bảng, RLS, SMTP hay mẫu thư hosted. Đã gửi thử recovery OTP qua Auth API lúc 21:09 (UTC+7), nhận HTTP 200;
Auth log ghi Hook ran successfully và gmail-otp trả 200 sau Gmail API chấp nhận.
Người dùng cần kiểm tra inbox/Spam để xác nhận nhận thư.
ADR-051 thay cách gửi SMTP/App Password của ADR-050 bằng Gmail API qua HTTPS.

## 1. Tạo OAuth Client trên Google Cloud

1. Mở https://console.cloud.google.com/, tạo hoặc chọn project Weather.
2. Vào APIs & Services → Library → tìm **Gmail API** → Enable.
3. Vào Google Auth Platform → Branding → Get Started; điền tên Weather, email
   hỗ trợ và email liên hệ bằng Gmail cá nhân.
4. Chọn Audience **External**. Trong thời gian Testing, thêm Gmail dùng gửi OTP
   vào danh sách Test users. Đây là tài khoản gửi của server; người dùng nhận OTP
   không cần đăng nhập Google hay trở thành Test user.
5. Trong Data Access thêm đúng scope `https://www.googleapis.com/auth/gmail.send`.
6. Vào Clients → Create client → **Web application**, tên Weather OTP Server.
   Authorized JavaScript origins để trống. Authorized redirect URIs điền chính xác:

   ```text
   https://developers.google.com/oauthplayground
   ```

7. Create và lưu **Client ID**, **Client secret** vào file riêng ở bước 3.

Credential này dành cho server gửi mail. Không tạo API key, Android client hay
Service account cho luồng Gmail cá nhân này. Không cần sửa callback đăng nhập
Supabase hoặc Site URL của app để cấp quyền gửi thư.

## 2. Lấy Refresh Token một lần

1. Mở https://developers.google.com/oauthplayground/.
2. Bấm bánh răng, chọn **Use your own OAuth credentials**, điền Client ID và
   Client secret vừa tạo. Chọn Server-side, Google endpoints, Access type Offline
   và Force prompt Consent Screen.
3. Đóng bảng cấu hình; nhập scope `https://www.googleapis.com/auth/gmail.send`
   vào ô Input your own scopes → Authorize APIs.
4. Đăng nhập **đúng Gmail sẽ ghi ở GMAIL_USER**, đọc và chấp thuận quyền gửi thư.
5. Bấm Exchange authorization code for tokens. Lưu **Refresh token** vào file
   bên dưới. Không lấy Access token ngắn hạn thay cho Refresh token.

Google OAuth Playground mặc định thu hồi token sau 24 giờ nếu dùng credential
của Playground. Vì vậy phải bật **Use your own OAuth credentials** trước khi cấp
quyền. Với External + Testing và scope Gmail, Refresh Token hết hạn sau 7 ngày.
Để dùng lâu dài, chuyển Audience sang In production và cấp lại token; thực hiện
các yêu cầu xác minh của Google nếu áp dụng. Chế độ Production không bảo đảm token
không bao giờ bị thu hồi (ví dụ đổi mật khẩu Gmail hoặc thu hồi quyền truy cập).

## 3. File cấu hình riêng

`weather/.env.supabase-management` được Git bỏ qua; các trường đã được tạo sẵn:

```dotenv
GMAIL_USER=your_personal_address@gmail.com
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REFRESH_TOKEN=your_refresh_token
```

Giữ nguyên `SUPABASE_ACCESS_TOKEN` và `SEND_EMAIL_HOOK_SECRET` đã có trong file.
Không dùng `GMAIL_APP_PASSWORD` nữa. Không đưa secrets vào `.env` của Expo, biến
`EXPO_PUBLIC_*`, Git hoặc tin nhắn chat. Hộp thư cấp quyền ở bước 2 phải trùng
`GMAIL_USER`.

## 4. Kích hoạt và kiểm tra

Chạy từ thư mục weather sau khi đã điền đủ:

```sh
node --env-file=.env.supabase-management scripts/configure-email-otp.mjs --gmail
node --env-file=.env.supabase-management scripts/configure-email-otp.mjs --check
```

`--gmail` lưu secrets server, kiểm tra chữ ký và thử đổi Refresh Token lấy Access
Token **không gửi thư**, rồi đặt `mailer_otp_length=6`, bật các trường `hook_send_email_*` và đọc lại
trạng thái. Mã mới luôn có 6 số, ô nhập và xác minh client cũng giới hạn 6 số.
Sau khi đổi cấu hình cần yêu cầu mã mới; không cắt bớt mã dài trong email cũ. Probe này chưa chứng minh Gmail API đã bật, tài khoản gửi khớp hoặc inbox đã
nhận thư; yêu cầu OTP mới trong app để xác minh toàn bộ luồng. Không tăng rate limit,
không tắt xác nhận email và không ghi `smtp_*`. Lỗi token chặn việc bật hook mới.

- `--check` hoặc không có cờ: chỉ GET trạng thái.
- `--stage`: lưu khóa ký, gọi signed health probe, không bật hook.

Script không ghi đè hook đang hoạt động ở URL khác. Với hook này đã bật, nó kiểm
tra khóa ký hiện tại trước khi ghi secrets. Lỗi Google trả thông báo chung, không
trả dữ liệu provider hoặc credentials.

## Mã server

- `index.ts`: đọc secrets server, nối xác minh Standard Webhooks với Gmail sender.
- `gmail.ts`: đổi/cached Access Token, tạo MIME UTF-8, POST Gmail API qua HTTPS.
  Chỉ scope gmail.send, không xin đọc hộp thư. Timeout mỗi request 2 giây.
- `handler.ts`: tạo thư mã số, kiểm tra đầu vào, xử lý retry và email change.
- `deno.json`: pin Standard Webhooks; không còn dependency Nodemailer.

Gateway JWT tắt vì Supabase Auth gọi bằng chữ ký Standard Webhooks. Hàm xác minh
HMAC và timestamp trước mọi thao tác gửi/probe. OTP mới có 6 chữ số và giữ nguyên số 0
đầu, bỏ qua redirect_to/site_url/token hash và metadata người dùng. Đổi email an
toàn gửi mã riêng tới địa chỉ cũ và mới. Supabase vẫn quản lý hạn mã, chống dùng
lại, phiên đăng nhập và giới hạn yêu cầu. Không cần service-role key.

Retry trùng ID được gộp trong một instance nóng trong 5 phút, không bảo đảm chống
trùng xuyên instance. Giới hạn gửi Gmail, Supabase và thời gian thực thi hook vẫn
áp dụng. Lỗi giao thư không tự chuyển về link xác nhận mặc định.

## Kiểm tra

```sh
npm run typecheck
npm run test:mail
```

TypeScript app và hai module server thuần đều đạt; 24 test mail/setup đạt, bao gồm
mã số không có link, signature, retry, đổi email, MIME tiếng Việt, OAuth refresh,
cache token, scope thiếu, từ chối giao thư và không lộ secrets. Bộ 319 test app đã
đạt trước thay đổi transport này; không có thay đổi mã src trong lần đổi OAuth.
Google OAuth refresh đã thành công, hook đã bật và đọc lại đúng cấu hình.
Recovery OTP thực tế đã qua Auth → gmail-otp → Gmail API thành công (HTTP 200,
21:09 UTC+7). Inbox/Spam và việc nhập mã vẫn cần người dùng xác nhận. Thư mặc định
Supabase gần nhất trong log lúc 21:03 được gửi trước khi hook bật lúc 21:06.

## Nguồn chính thức

- https://supabase.com/docs/guides/auth/auth-hooks/send-email-hook
- https://developers.google.com/workspace/gmail/api/quickstart/js
- https://developers.google.com/workspace/gmail/api/auth/scopes
- https://developers.google.com/workspace/gmail/api/guides/sending
- https://developers.google.com/identity/protocols/oauth2
- https://developers.google.com/oauthplayground/
