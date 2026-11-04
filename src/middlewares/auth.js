import prisma from '../config/prisma.js';
import AppError from '../utils/AppError.js';
import { isAdmin } from '../utils/authorization.js';
import { readTaiKhoanFromToken } from '../utils/token.js';

function readBearerToken(req) {
  const [scheme, token] = (req.headers.authorization ?? '').split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    throw new AppError(401, 'Vui lòng đăng nhập');
  }
  return token;
}

// Lấy quyền từ database để tài khoản bị xoá hoặc đổi quyền có hiệu lực ngay, không chờ token hết hạn
export async function authenticate(req, res, next) {
  const taiKhoan = readTaiKhoanFromToken(readBearerToken(req));
  const user = await prisma.nguoiDung.findUnique({
    where: { taiKhoan },
    select: { taiKhoan: true, loaiNguoiDung: true },
  });
  if (!user) {
    throw new AppError(401, 'Tài khoản không còn tồn tại');
  }

  req.user = user;
  next();
}

export function requireAdmin(req, res, next) {
  if (!isAdmin(req.user)) {
    throw new AppError(403, 'Không đủ quyền truy cập');
  }
  next();
}
