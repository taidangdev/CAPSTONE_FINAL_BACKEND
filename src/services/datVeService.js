import prisma from '../config/prisma.js';
import AppError from '../utils/AppError.js';
import { isUniqueViolation } from '../utils/prismaError.js';

const SEAT_SELECT = { maGhe: true, tenGhe: true, loaiGhe: true, maRap: true };

function assertNotInPast(dateTime, message) {
  if (dateTime <= new Date()) {
    throw new AppError(400, message);
  }
}

function toSeatMap({ maLichChieu, ngayGioChieu, giaVe, phim, rapPhim, datVe }) {
  const bookedSeatIds = new Set(datVe.map(({ maGhe }) => maGhe));

  return {
    thongTinPhim: {
      maLichChieu,
      tenCumRap: rapPhim.cumRap.tenCumRap,
      tenRap: rapPhim.tenRap,
      diaChi: rapPhim.cumRap.diaChi,
      tenPhim: phim.tenPhim,
      hinhAnh: phim.hinhAnh,
      ngayChieuGioChieu: ngayGioChieu,
    },
    danhSachGhe: rapPhim.ghe.map((seat) => ({
      ...seat,
      giaVe,
      daDat: bookedSeatIds.has(seat.maGhe),
    })),
  };
}

async function findSeatsInRoom(tickets, maRap) {
  const seatIds = tickets.map(({ maGhe }) => maGhe);
  const seats = await prisma.ghe.findMany({ where: { maGhe: { in: seatIds }, maRap }, select: SEAT_SELECT });
  if (seats.length !== seatIds.length) {
    throw new AppError(400, 'Có ghế không thuộc rạp của lịch chiếu này');
  }
  return seats;
}

// Một câu INSERT nhiều dòng là nguyên tử, nên khi có ghế trùng thì không vé nào được tạo.
// Khoá chính (ma_lich_chieu, ma_ghe) đảm bảo không đặt trùng ghế kể cả khi nhiều người đặt cùng lúc.
async function insertTickets(seats, maLichChieu, taiKhoan) {
  try {
    await prisma.datVe.createMany({
      data: seats.map(({ maGhe }) => ({ maLichChieu, maGhe, taiKhoan })),
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new AppError(409, 'Có ghế đã được đặt, vui lòng chọn ghế khác');
    }
    throw error;
  }
}

async function assertMovieAndRoomExist(maPhim, maRap) {
  const [movie, room] = await Promise.all([
    prisma.phim.findUnique({ where: { maPhim }, select: { maPhim: true } }),
    prisma.rapPhim.findUnique({ where: { maRap }, select: { maRap: true } }),
  ]);
  if (!movie) {
    throw new AppError(404, 'Không tìm thấy phim');
  }
  if (!room) {
    throw new AppError(404, 'Không tìm thấy rạp');
  }
}

export async function getSeatMap(maLichChieu) {
  const showtime = await prisma.lichChieu.findUniqueOrThrow({
    where: { maLichChieu },
    select: {
      maLichChieu: true,
      ngayGioChieu: true,
      giaVe: true,
      phim: { select: { tenPhim: true, hinhAnh: true } },
      rapPhim: {
        select: {
          tenRap: true,
          cumRap: { select: { tenCumRap: true, diaChi: true } },
          ghe: { select: SEAT_SELECT, orderBy: { maGhe: 'asc' } },
        },
      },
      datVe: { select: { maGhe: true } },
    },
  });
  return toSeatMap(showtime);
}

export async function bookTickets({ maLichChieu, danhSachVe }, taiKhoan) {
  const showtime = await prisma.lichChieu.findUniqueOrThrow({ where: { maLichChieu } });
  assertNotInPast(showtime.ngayGioChieu, 'Lịch chiếu đã diễn ra');

  const seats = await findSeatsInRoom(danhSachVe, showtime.maRap);
  await insertTickets(seats, maLichChieu, taiKhoan);

  return {
    maLichChieu,
    danhSachGhe: seats,
    giaVe: showtime.giaVe,
    tongTien: showtime.giaVe * seats.length,
  };
}

export async function createShowtime({ maPhim, maRap, ngayChieuGioChieu, giaVe }) {
  assertNotInPast(ngayChieuGioChieu, 'Thời gian chiếu phải ở tương lai');
  await assertMovieAndRoomExist(maPhim, maRap);

  try {
    const { ngayGioChieu, ...showtime } = await prisma.lichChieu.create({
      data: { maPhim, maRap, ngayGioChieu: ngayChieuGioChieu, giaVe },
    });
    return { ...showtime, ngayChieuGioChieu: ngayGioChieu };
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new AppError(409, 'Rạp đã có suất chiếu vào thời điểm này');
    }
    throw error;
  }
}
