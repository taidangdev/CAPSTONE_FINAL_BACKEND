# CyberMovie API - Node.js Capstone Project

Hệ thống Backend RESTful API Quản lý Phim, Cụm Rạp và Đặt vé xem phim trực tuyến — Đồ án cuối khóa môn Node.js tại Cybersoft Academy.

---

## 📌 Tổng quan dự án

Dự án được xây dựng theo kiến trúc nhiều tầng (Layered Architecture) chuẩn Clean Code:
- **Routes**: Tiếp nhận request và phân luồng.
- **Middlewares**: Xác thực JWT (`authenticate`), phân quyền (`requireAdmin`), bắt lỗi tập trung (`errorHandler`), xử lý upload ảnh (`uploadImage`).
- **Validators**: Kiểm tra và làm sạch dữ liệu đầu vào bằng thư viện **Zod** (`zod`).
- **Controllers**: Điều phối request/response, bắt lỗi HTTP.
- **Services**: Xử lý logic nghiệp vụ, giao tiếp với Database qua **Prisma ORM**.
- **Database**: Hệ quản trị cơ sở dữ liệu quan hệ **MySQL 8**.

Dự án hoàn thành đầy đủ **30/30 API** theo đặc tả Swagger Cybersoft, tích hợp sẵn **Swagger UI** tương tác trực tiếp trên trình duyệt và xuất kèm file **Postman Collection**.

---

## 🛠️ Công nghệ sử dụng (Tech Stack)

- **Ngôn ngữ & Runtime**: Node.js (v20+) (ES Modules - `import/export`).
- **Framework Web**: Express 5.
- **ORM & Database**: Prisma ORM v6, MySQL 8.
- **Validation**: Zod.
- **Bảo mật & Xác thực**: JSON Web Token (JWT), `bcryptjs`.
- **Xử lý Upload**: Multer.
- **Tài liệu & Test API**: Swagger UI (`swagger-ui-express`), Postman Collection v2.1.
- **DevOps / Môi trường**: Docker Compose.

---

## 🚀 Hướng dẫn cài đặt và khởi chạy dự án

### 1. Yêu cầu môi trường
- Đã cài đặt **Node.js** (phiên bản `>= 20.x`).
- Đã cài đặt **Docker Desktop** (khuyến nghị để chạy MySQL nhanh gọn) hoặc đã có sẵn server **MySQL 8** cục bộ.

### 2. Cài đặt các gói phụ thuộc (Dependencies)
```bash
npm install
```

### 3. Cấu hình biến môi trường
Tạo file `.env` từ file mẫu `.env.example`:
```bash
cp .env.example .env
```
Nội dung file `.env` mẫu:
```env
PORT=3000
PUBLIC_URL=http://localhost:3000

DB_ROOT_PASSWORD=rootpassword
DATABASE_URL=mysql://root:rootpassword@127.0.0.1:3307/capstone_movie

JWT_SECRET=supersecretjwtkey_capstone_2026
JWT_EXPIRES_IN=1d

# Mật khẩu cho tài khoản admin và khachhang khởi tạo từ seed.js
SEED_PASSWORD=123456
```

### 4. Khởi động Database và tạo dữ liệu mẫu
- **Bước 4.1: Chạy MySQL bằng Docker**
  ```bash
  npm run db:up
  ```
  *(Lệnh này sẽ khởi động container MySQL 8 trên cổng `3307` theo file `docker-compose.yml`)*.

- **Bước 4.2: Chạy migration để tạo bảng Database**
  ```bash
  npm run db:migrate
  ```

- **Bước 4.3: Nạp dữ liệu mẫu (Seed Data)**
  ```bash
  npm run db:seed
  ```
  *(Dữ liệu mẫu bao gồm: 3 hệ thống rạp BHD, CGV, Galaxy; các cụm rạp, phòng chiếu, 40 ghế/phòng; danh sách phim mẫu, banner và các suất chiếu).*

### 5. Khởi động Server
- Chế độ phát triển (Auto reload với Nodemon):
  ```bash
  npm run dev
  ```
- Chế độ sản phẩm:
  ```bash
  npm start
  ```

Server sẽ lắng nghe tại: `http://localhost:3000`

---

## 📖 Trải nghiệm API với Swagger UI

Mở trình duyệt bất kỳ và truy cập vào:
```
http://localhost:3000/api-docs
```
*(Hoặc truy cập trực tiếp `http://localhost:3000/`, hệ thống sẽ tự động chuyển hướng về trang tài liệu)*.

### Hướng dẫn Test các API yêu cầu quyền:
1. Tại nhóm **QuanLyNguoiDung**, mở API `POST /api/QuanLyNguoiDung/DangNhap`.
2. Bấm **Try it out** và đăng nhập với một trong hai tài khoản mẫu:
   - **Tài khoản Quản trị (Admin):**
     - Tài khoản: `admin`
     - Mật khẩu: `123456` (hoặc giá trị cấu hình ở `SEED_PASSWORD`)
   - **Tài khoản Khách hàng (User):**
     - Tài khoản: `khachhang`
     - Mật khẩu: `123456`
3. Nhận mã `accessToken` trong kết quả trả về.
4. Cuộn lên đầu trang Swagger UI, bấm vào nút **Authorize** (biểu tượng ổ khóa màu xanh).
5. Nhập vào ô: `Bearer <accessToken_vua_copy>` rồi bấm **Authorize**.
6. Lúc này bạn có thể test toàn bộ các API đặt vé, thêm/sửa/xoá phim và quản lý người dùng trực tiếp trên trình duyệt.

---

## 📬 Sử dụng với Postman

Dự án cung cấp sẵn file Postman Collection chuẩn:
- File: **[`CyberMovie_API.postman_collection.json`](./CyberMovie_API.postman_collection.json)**
- **Cách dùng:**
  1. Mở ứng dụng Postman.
  2. Bấm nút **Import** ở góc trên bên trái, chọn file `CyberMovie_API.postman_collection.json`.
  3. Bộ sưu tập sẽ tự động tạo đủ 30 Request chia thành 4 thư mục: `QuanLyNguoiDung`, `QuanLyPhim`, `QuanLyRap`, `QuanLyDatVe`.
  4. Biến môi trường `{{baseUrl}}` mặc định là `http://localhost:3000`. Sau khi gọi API Đăng nhập, chỉ cần gán token vào biến `{{accessToken}}` của collection.

---

## 📋 Danh sách 30 API đã triển khai

### 1. Quản lý Người dùng (`/api/QuanLyNguoiDung`)
| Phương thức | Endpoint | Mô tả | Quyền |
| :--- | :--- | :--- | :--- |
| `GET` | `/LayDanhSachLoaiNguoiDung` | Lấy danh sách loại người dùng (KhachHang, QuanTri) | Public |
| `POST` | `/DangNhap` | Đăng nhập hệ thống, nhận Access Token | Public |
| `POST` | `/DangKy` | Đăng ký tài khoản khách hàng mới | Public |
| `GET` | `/LayDanhSachNguoiDung` | Lấy toàn bộ danh sách người dùng | Admin |
| `GET` | `/TimKiemNguoiDung` | Tìm kiếm người dùng theo từ khóa | Admin |
| `GET` | `/LayDanhSachNguoiDungPhanTrang` | Lấy danh sách người dùng có phân trang | Admin |
| `GET` | `/TimKiemNguoiDungPhanTrang` | Tìm kiếm người dùng có phân trang | Admin |
| `POST` | `/ThongTinTaiKhoan` | Xem thông tin tài khoản cá nhân & lịch sử đặt vé | User |
| `POST` | `/LayThongTinNguoiDung` | Xem thông tin chi tiết một người dùng | User / Admin |
| `POST` | `/ThemNguoiDung` | Thêm người dùng mới vào hệ thống | Admin |
| `PUT` | `/CapNhatThongTinNguoiDung` | Cập nhật thông tin người dùng | User / Admin |
| `POST` | `/CapNhatThongTinNguoiDung` | Cập nhật thông tin (hỗ trợ phương thức POST) | User / Admin |
| `DELETE` | `/XoaNguoiDung` | Xóa tài khoản người dùng | Admin |

### 2. Quản lý Phim (`/api/QuanLyPhim`)
| Phương thức | Endpoint | Mô tả | Quyền |
| :--- | :--- | :--- | :--- |
| `GET` | `/LayDanhSachBanner` | Lấy danh sách banner quảng cáo trang chủ | Public |
| `GET` | `/LayDanhSachPhim` | Lấy danh sách toàn bộ phim hoặc tìm theo tên | Public |
| `GET` | `/LayDanhSachPhimPhanTrang` | Danh sách phim có phân trang | Public |
| `GET` | `/LayDanhSachPhimTheoNgay` | Danh sách phim lọc theo khoảng ngày khởi chiếu | Public |
| `GET` | `/LayThongTinPhim` | Lấy thông tin chi tiết một bộ phim | Public |
| `POST` | `/ThemPhimUploadHinh` | Thêm phim mới kèm upload poster phim | Admin |
| `POST` | `/CapNhatPhimUpload` | Cập nhật thông tin phim kèm upload poster | Admin |
| `POST` | `/` | Cập nhật hình ảnh phim theo tên phim | Admin |
| `DELETE` | `/XP` | Xóa phim theo mã phim | Admin |
| `DELETE` | `/XoaPhim` | Xóa phim theo mã phim | Admin |

### 3. Quản lý Rạp (`/api/QuanLyRap`)
| Phương thức | Endpoint | Mô tả | Quyền |
| :--- | :--- | :--- | :--- |
| `GET` | `/LayThongTinHeThongRap` | Lấy thông tin hệ thống rạp chiếu (BHD, CGV,...) | Public |
| `GET` | `/LayThongTinCumRapTheoHeThong` | Lấy danh sách cụm rạp và các phòng chiếu | Public |
| `GET` | `/LayThongTinLichChieuHeThongRap`| Lấy toàn bộ lịch chiếu phim theo hệ thống rạp | Public |
| `GET` | `/LayThongTinLichChieuPhim` | Lấy lịch chiếu của một bộ phim cụ thể | Public |

### 4. Quản lý Đặt vé (`/api/QuanLyDatVe`)
| Phương thức | Endpoint | Mô tả | Quyền |
| :--- | :--- | :--- | :--- |
| `GET` | `/LayDanhSachPhongVe` | Lấy sơ đồ phòng vé, danh sách ghế & trạng thái đã đặt | Public |
| `POST` | `/DatVe` | Đặt vé xem phim (chống đặt trùng ghế đồng thời) | User |
| `POST` | `/TaoLichChieu` | Tạo lịch chiếu phim mới cho phòng chiếu | Admin |

---

## 🔒 Xử lý nâng cao & Điểm nổi bật
1. **Chống đặt trùng ghế (Race Condition):** Cơ chế khoá ở tầng Database bằng ràng buộc duy nhất `UNIQUE (ma_lich_chieu, ma_ghe)` kết hợp thao tác `INSERT` nguyên tử đảm bảo khi hàng chục người cùng ấn đặt một ghế cùng 1 tích tắc, chỉ duy nhất 1 người thành công, các request còn lại nhận mã `409 Conflict`.
2. **Loại bỏ TokenCybersoft:** Tuân thủ yêu cầu của đề tài: Không yêu cầu header `TokenCybersoft`, toàn bộ hệ thống sử dụng tiêu chuẩn chuẩn ngành `Authorization: Bearer <JWT>`.
3. **Clean Code & Validation:** Toàn bộ tham số đầu vào được validate chặt chẽ qua schema Zod; mật khẩu mã hóa một chiều an toàn bằng `bcryptjs`.
