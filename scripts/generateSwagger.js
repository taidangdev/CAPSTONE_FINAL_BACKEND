import fs from 'fs';
import path from 'path';

const srcPath = 'C:/Users/ASUS/AppData/Local/Temp/claude/d--STUDY-WEB-BE-nodeJs56-New-folder-CAPSTONE-FINAL/07ba000e-0f39-49fb-ad54-9aafd6722504/scratchpad/swagger.json';
const raw = JSON.parse(fs.readFileSync(srcPath, 'utf8'));

const authEndpoints = new Set([
  'GET /api/QuanLyNguoiDung/LayDanhSachNguoiDung',
  'GET /api/QuanLyNguoiDung/TimKiemNguoiDung',
  'GET /api/QuanLyNguoiDung/LayDanhSachNguoiDungPhanTrang',
  'GET /api/QuanLyNguoiDung/TimKiemNguoiDungPhanTrang',
  'POST /api/QuanLyNguoiDung/ThongTinTaiKhoan',
  'POST /api/QuanLyNguoiDung/LayThongTinNguoiDung',
  'POST /api/QuanLyNguoiDung/ThemNguoiDung',
  'PUT /api/QuanLyNguoiDung/CapNhatThongTinNguoiDung',
  'POST /api/QuanLyNguoiDung/CapNhatThongTinNguoiDung',
  'DELETE /api/QuanLyNguoiDung/XoaNguoiDung',
  'POST /api/QuanLyPhim/ThemPhimUploadHinh',
  'POST /api/QuanLyPhim/CapNhatPhimUpload',
  'POST /api/QuanLyPhim',
  'DELETE /api/QuanLyPhim/XP',
  'DELETE /api/QuanLyPhim/XoaPhim',
  'POST /api/QuanLyDatVe/DatVe',
  'POST /api/QuanLyDatVe/TaoLichChieu',
]);

const cleanedPaths = {};

for (const [p, methods] of Object.entries(raw.paths)) {
  cleanedPaths[p] = {};
  for (const [m, op] of Object.entries(methods)) {
    const key = m.toUpperCase() + ' ' + p;
    const isAuth = authEndpoints.has(key);

    const newOp = {
      tags: op.tags,
      summary: op.operationId,
      consumes: op.consumes || ['application/json'],
      produces: ['application/json'],
      parameters: (op.parameters || []).filter((param) => {
        return param.name !== 'TokenCybersoft' && param.name !== 'Authorization';
      }),
      responses: {
        200: { description: 'Thành công' },
        400: { description: 'Dữ liệu không hợp lệ' },
      },
    };

    if (isAuth) {
      newOp.security = [{ Bearer: [] }];
      newOp.responses[401] = { description: 'Chưa đăng nhập / Token không hợp lệ' };
      if (
        key.includes('Admin') ||
        ['ThemNguoiDung', 'XoaNguoiDung', 'ThemPhim', 'CapNhatPhim', 'UploadHinhAnh', 'XP', 'XoaPhim', 'TaoLichChieu'].some(
          (s) => op.operationId.includes(s)
        )
      ) {
        newOp.responses[403] = { description: 'Không có quyền Quản trị (Admin)' };
      }
    }

    cleanedPaths[p][m] = newOp;
  }
}

// Chỉnh sửa chi tiết các endpoint Upload file
cleanedPaths['/api/QuanLyPhim/ThemPhimUploadHinh']['post'].parameters = [
  { name: 'tenPhim', in: 'formData', required: true, type: 'string', description: 'Tên phim' },
  { name: 'trailer', in: 'formData', required: false, type: 'string', description: 'Link trailer YouTube' },
  { name: 'moTa', in: 'formData', required: false, type: 'string', description: 'Mô tả nội dung phim' },
  { name: 'ngayKhoiChieu', in: 'formData', required: true, type: 'string', description: 'Ngày khởi chiếu (DD/MM/YYYY hoặc ISO)' },
  { name: 'danhGia', in: 'formData', required: false, type: 'integer', default: 10, description: 'Đánh giá từ 0 - 10' },
  { name: 'hot', in: 'formData', required: false, type: 'boolean', default: true },
  { name: 'dangChieu', in: 'formData', required: false, type: 'boolean', default: true },
  { name: 'sapChieu', in: 'formData', required: false, type: 'boolean', default: false },
  { name: 'hinhAnh', in: 'formData', required: true, type: 'file', description: 'File hình poster phim' },
];

cleanedPaths['/api/QuanLyPhim/CapNhatPhimUpload']['post'].parameters = [
  { name: 'maPhim', in: 'formData', required: true, type: 'integer', description: 'Mã phim cần cập nhật' },
  { name: 'tenPhim', in: 'formData', required: false, type: 'string', description: 'Tên phim' },
  { name: 'trailer', in: 'formData', required: false, type: 'string', description: 'Link trailer YouTube' },
  { name: 'moTa', in: 'formData', required: false, type: 'string', description: 'Mô tả nội dung phim' },
  { name: 'ngayKhoiChieu', in: 'formData', required: false, type: 'string', description: 'Ngày khởi chiếu' },
  { name: 'danhGia', in: 'formData', required: false, type: 'integer', description: 'Đánh giá từ 0 - 10' },
  { name: 'hot', in: 'formData', required: false, type: 'boolean' },
  { name: 'dangChieu', in: 'formData', required: false, type: 'boolean' },
  { name: 'sapChieu', in: 'formData', required: false, type: 'boolean' },
  { name: 'hinhAnh', in: 'formData', required: false, type: 'file', description: 'File hình poster phim mới (nếu có)' },
];

cleanedPaths['/api/QuanLyPhim']['post'].parameters = [
  { name: 'tenPhim', in: 'query', required: true, type: 'string', description: 'Tên phim cần cập nhật ảnh' },
  { name: 'maNhom', in: 'query', required: false, type: 'string', default: 'GP01' },
  { name: 'file', in: 'formData', required: true, type: 'file', description: 'File hình ảnh' },
];

const definitions = {
  ThongTinDangNhapVM: {
    type: 'object',
    required: ['taiKhoan', 'matKhau'],
    properties: {
      taiKhoan: { type: 'string', example: 'admin' },
      matKhau: { type: 'string', example: '123456' },
    },
  },
  NguoiDung_VM: {
    type: 'object',
    required: ['taiKhoan', 'matKhau', 'email', 'hoTen'],
    properties: {
      taiKhoan: { type: 'string', example: 'nguyenvana' },
      matKhau: { type: 'string', example: '123456' },
      email: { type: 'string', example: 'vana@gmail.com' },
      soDt: { type: 'string', example: '0901234567' },
      hoTen: { type: 'string', example: 'Nguyễn Văn A' },
    },
  },
  NguoiDungVM: {
    type: 'object',
    required: ['taiKhoan'],
    properties: {
      taiKhoan: { type: 'string', example: 'nguyenvana' },
      matKhau: { type: 'string', example: '123456' },
      email: { type: 'string', example: 'vana@gmail.com' },
      soDt: { type: 'string', example: '0901234567' },
      maLoaiNguoiDung: { type: 'string', enum: ['KhachHang', 'QuanTri'], example: 'KhachHang' },
      hoTen: { type: 'string', example: 'Nguyễn Văn A' },
    },
  },
  LichChieuInsert: {
    type: 'object',
    required: ['maPhim', 'maRap', 'ngayChieuGioChieu', 'giaVe'],
    properties: {
      maPhim: { type: 'integer', example: 1 },
      maRap: { type: 'integer', example: 1 },
      ngayChieuGioChieu: {
        type: 'string',
        example: '20/12/2026 19:30:00',
        description: 'DD/MM/YYYY HH:mm:ss hoặc định dạng ISO',
      },
      giaVe: { type: 'number', example: 90000 },
    },
  },
  DanhSachVeDat: {
    type: 'object',
    required: ['maLichChieu', 'danhSachVe'],
    properties: {
      maLichChieu: { type: 'integer', example: 1 },
      danhSachVe: {
        type: 'array',
        items: { $ref: '#/definitions/VeVM' },
      },
    },
  },
  VeVM: {
    type: 'object',
    required: ['maGhe'],
    properties: {
      maGhe: { type: 'integer', example: 1 },
    },
  },
};

const swaggerSpec = {
  swagger: '2.0',
  info: {
    title: 'CyberMovie API - Node.js Capstone',
    description:
      'Hệ thống API Đặt vé xem phim (QuanLyNguoiDung, QuanLyPhim, QuanLyRap, QuanLyDatVe) chuẩn Swagger Cybersoft.',
    version: '1.0.0',
  },
  basePath: '/',
  securityDefinitions: {
    Bearer: {
      type: 'apiKey',
      name: 'Authorization',
      in: 'header',
      description: "Nhập JWT token theo cú pháp: Bearer <token>",
    },
  },
  paths: cleanedPaths,
  definitions,
};

fs.mkdirSync('src/docs', { recursive: true });
fs.writeFileSync('src/docs/swagger.json', JSON.stringify(swaggerSpec, null, 2), 'utf8');
console.log('Successfully written src/docs/swagger.json');

