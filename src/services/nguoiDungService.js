import { LoaiNguoiDung } from '@prisma/client';
import prisma from '../config/prisma.js';
import AppError from '../utils/AppError.js';
import { assertSelfOrAdmin, isAdmin } from '../utils/authorization.js';
import { paginate } from '../utils/pagination.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { signAccessToken } from '../utils/token.js';

const USER_SELECT = {
  taiKhoan: true,
  hoTen: true,
  email: true,
  soDt: true,
  loaiNguoiDung: true,
};

const USER_TYPES = [
  { maLoaiNguoiDung: LoaiNguoiDung.KhachHang, tenLoai: 'Khách hàng' },
  { maLoaiNguoiDung: LoaiNguoiDung.QuanTri, tenLoai: 'Quản trị' },
];

function buildBookingHistorySelect(taiKhoan) {
  return {
    maLichChieu: true,
    ngayGioChieu: true,
    giaVe: true,
    phim: { select: { tenPhim: true, hinhAnh: true } },
    rapPhim: {
      select: {
        tenRap: true,
        cumRap: {
          select: {
            tenCumRap: true,
            heThongRap: { select: { tenHeThongRap: true } },
          },
        },
      },
    },
    datVe: {
      where: { taiKhoan },
      select: { ghe: { select: { maGhe: true, tenGhe: true, loaiGhe: true } } },
    },
  };
}

function toUserResponse({ loaiNguoiDung, ...user }) {
  return { ...user, maLoaiNguoiDung: loaiNguoiDung };
}

function toBookingHistoryItem({ phim, rapPhim, datVe, ngayGioChieu, ...showtime }) {
  return {
    ...showtime,
    ngayChieuGioChieu: ngayGioChieu,
    tenPhim: phim.tenPhim,
    hinhAnh: phim.hinhAnh,
    tenRap: rapPhim.tenRap,
    tenCumRap: rapPhim.cumRap.tenCumRap,
    tenHeThongRap: rapPhim.cumRap.heThongRap.tenHeThongRap,
    danhSachGhe: datVe.map(({ ghe }) => ghe),
  };
}

function buildUserFilter(tuKhoa) {
  if (!tuKhoa) {
    return {};
  }

  const searchableFields = ['taiKhoan', 'hoTen', 'email', 'soDt'];
  return { OR: searchableFields.map((field) => ({ [field]: { contains: tuKhoa } })) };
}

async function assertAccountAvailable(taiKhoan, email) {
  const existingUser = await prisma.nguoiDung.findFirst({
    where: { OR: [{ taiKhoan }, { email }] },
    select: { taiKhoan: true },
  });
  if (existingUser) {
    throw new AppError(409, 'Tài khoản hoặc email đã tồn tại');
  }
}

async function assertEmailNotUsedByOthers(email, taiKhoan) {
  const otherUser = await prisma.nguoiDung.findFirst({
    where: { email, NOT: { taiKhoan } },
    select: { taiKhoan: true },
  });
  if (otherUser) {
    throw new AppError(409, 'Email đã được sử dụng');
  }
}

async function findBookingHistory(taiKhoan) {
  const showtimes = await prisma.lichChieu.findMany({
    where: { datVe: { some: { taiKhoan } } },
    select: buildBookingHistorySelect(taiKhoan),
    orderBy: { ngayGioChieu: 'desc' },
  });
  return showtimes.map(toBookingHistoryItem);
}

export function getUserTypes() {
  return USER_TYPES;
}

export async function login({ taiKhoan, matKhau }) {
  const account = await prisma.nguoiDung.findUnique({
    where: { taiKhoan },
    select: { ...USER_SELECT, matKhau: true },
  });
  const { matKhau: passwordHash, ...profile } = account ?? {};
  if (!passwordHash || !(await verifyPassword(matKhau, passwordHash))) {
    throw new AppError(401, 'Tài khoản hoặc mật khẩu không đúng');
  }

  return { ...toUserResponse(profile), accessToken: signAccessToken(profile.taiKhoan) };
}

export async function createUser({ maLoaiNguoiDung, matKhau, ...profile }) {
  await assertAccountAvailable(profile.taiKhoan, profile.email);

  const user = await prisma.nguoiDung.create({
    data: {
      ...profile,
      matKhau: await hashPassword(matKhau),
      loaiNguoiDung: maLoaiNguoiDung,
    },
    select: USER_SELECT,
  });
  return toUserResponse(user);
}

export async function getUsers({ tuKhoa }) {
  const users = await prisma.nguoiDung.findMany({
    where: buildUserFilter(tuKhoa),
    select: USER_SELECT,
    orderBy: { taiKhoan: 'asc' },
  });
  return users.map(toUserResponse);
}

export async function getUserPage({ tuKhoa, ...pagination }) {
  const page = await paginate(
    prisma.nguoiDung,
    { where: buildUserFilter(tuKhoa), select: USER_SELECT, orderBy: { taiKhoan: 'asc' } },
    pagination,
  );
  return { ...page, items: page.items.map(toUserResponse) };
}

export async function getUserDetail(taiKhoan, requester) {
  assertSelfOrAdmin(taiKhoan, requester);

  const user = await prisma.nguoiDung.findUniqueOrThrow({ where: { taiKhoan }, select: USER_SELECT });
  return toUserResponse(user);
}

export async function getAccountInfo(taiKhoan) {
  const [user, thongTinDatVe] = await Promise.all([
    prisma.nguoiDung.findUniqueOrThrow({ where: { taiKhoan }, select: USER_SELECT }),
    findBookingHistory(taiKhoan),
  ]);
  return { ...toUserResponse(user), thongTinDatVe };
}

export async function updateUser({ taiKhoan, matKhau, maLoaiNguoiDung, ...profile }, requester) {
  assertSelfOrAdmin(taiKhoan, requester);
  if (profile.email) {
    await assertEmailNotUsedByOthers(profile.email, taiKhoan);
  }

  const user = await prisma.nguoiDung.update({
    where: { taiKhoan },
    data: {
      ...profile,
      matKhau: matKhau ? await hashPassword(matKhau) : undefined,
      // Chỉ quản trị viên được đổi quyền, tránh người dùng tự nâng quyền cho mình
      loaiNguoiDung: isAdmin(requester) ? maLoaiNguoiDung : undefined,
    },
    select: USER_SELECT,
  });
  return toUserResponse(user);
}

export async function deleteUser(taiKhoan, requester) {
  if (taiKhoan === requester.taiKhoan) {
    throw new AppError(400, 'Không thể tự xoá tài khoản đang đăng nhập');
  }

  await prisma.nguoiDung.delete({ where: { taiKhoan } });
}
