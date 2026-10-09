# Vòng Quay May Mắn cho nhóm Zalo

Website mẫu có vòng quay đồng bộ thời gian thực:
- Admin đăng nhập bằng mật khẩu.
- Admin nhập danh sách tên.
- Chỉ Admin có thể quay.
- Tất cả người đang mở website nhận cùng kết quả.
- Mỗi người chỉ trúng một lần cho đến khi Admin đặt lại lịch sử.
- Lịch sử được lưu trong `data.json`.

## Chạy thử trên máy tính Windows

1. Cài Node.js bản LTS từ trang chính thức: https://nodejs.org/
2. Giải nén thư mục này.
3. Mở thư mục `vong_quay_may_man_zalo`.
4. Nhấp vào thanh địa chỉ của File Explorer, gõ `cmd` rồi nhấn Enter.
5. Chạy lệnh:
   ```
   npm install
   ```
6. Đổi mật khẩu Admin trước khi chạy:
   - Mở CMD tại thư mục dự án.
   - Chạy:
     ```
     set ADMIN_PASSWORD=MatKhauRiengCuaBan
     npm start
     ```
   - Thay `MatKhauRiengCuaBan` bằng mật khẩu riêng của bạn.
7. Mở Chrome tại `http://localhost:3000`.
8. Đăng nhập bằng mật khẩu vừa đặt, nhập danh sách tên, bấm **Lưu danh sách**, sau đó bấm **QUAY NGAY**.

## Lưu ý quan trọng về chia sẻ trong nhóm Zalo

`http://localhost:3000` chỉ mở trên chính máy tính đang chạy website. Muốn mọi người ở những nơi khác cùng xem một vòng quay trực tiếp, bạn cần đưa dự án lên một máy chủ/hosting có hỗ trợ ứng dụng Node.js và kết nối WebSocket. Sau khi triển khai, hãy gửi đường link HTTPS của máy chủ vào nhóm Zalo.

Không gửi mật khẩu Admin vào nhóm. Đổi mật khẩu mặc định trước khi dùng. Bản mẫu này chưa tích hợp đăng nhập Zalo và không tự lấy danh sách thành viên từ nhóm Zalo.

## Lưu trữ dữ liệu

Danh sách và lịch sử nằm trong `data.json`, được tạo tự động khi có dữ liệu. Khi triển khai lên hosting, hãy dùng nơi lưu trữ bền vững hoặc cơ sở dữ liệu phù hợp để dữ liệu không mất sau khi khởi động lại.

## Cấu trúc

- `server.js`: máy chủ, phân quyền Admin, chọn người trúng và đồng bộ.
- `public/index.html`: giao diện website.
- `package.json`: các thư viện cần cài.
