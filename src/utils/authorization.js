import { LoaiNguoiDung } from '@prisma/client';
import AppError from './AppError.js';

export function isAdmin(user) {
  return user.loaiNguoiDung === LoaiNguoiDung.QuanTri;
}

export function assertSelfOrAdmin(taiKhoan, requester) {
  if (requester.taiKhoan !== taiKhoan && !isAdmin(requester)) {
    throw new AppError(403, 'Không đủ quyền truy cập');
  }
}
