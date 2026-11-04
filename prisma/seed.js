import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const SEAT_ROWS = ['A', 'B', 'C', 'D', 'E'];
const SEATS_PER_ROW = 8;
const VIP_ROWS = ['D', 'E'];
const BCRYPT_ROUNDS = 10;
const DAY_IN_MS = 24 * 60 * 60 * 1000;

const cinemaSystems = [
  {
    maHeThongRap: 'BHDStar',
    tenHeThongRap: 'BHD Star Cineplex',
    clusters: [
      { tenCumRap: 'BHD Star Quận 3', diaChi: 'Quận 3, TP. Hồ Chí Minh' },
      { tenCumRap: 'BHD Star Quận 7', diaChi: 'Quận 7, TP. Hồ Chí Minh' },
    ],
  },
  {
    maHeThongRap: 'CGV',
    tenHeThongRap: 'CGV Cinemas',
    clusters: [
      { tenCumRap: 'CGV Quận 1', diaChi: 'Quận 1, TP. Hồ Chí Minh' },
      { tenCumRap: 'CGV Cầu Giấy', diaChi: 'Cầu Giấy, Hà Nội' },
    ],
  },
  {
    maHeThongRap: 'Galaxy',
    tenHeThongRap: 'Galaxy Cinema',
    clusters: [
      { tenCumRap: 'Galaxy Tân Bình', diaChi: 'Tân Bình, TP. Hồ Chí Minh' },
      { tenCumRap: 'Galaxy Hải Châu', diaChi: 'Hải Châu, Đà Nẵng' },
    ],
  },
];

const movies = [
  { tenPhim: 'Phim mẫu: Bầu Trời Thứ Bảy', danhGia: 9, hot: true, dangChieu: true, daysFromNow: -14 },
  { tenPhim: 'Phim mẫu: Thành Phố Không Ngủ', danhGia: 8, hot: true, dangChieu: true, daysFromNow: -7 },
  { tenPhim: 'Phim mẫu: Chuyến Tàu Cuối', danhGia: 7, dangChieu: true, daysFromNow: -3 },
  { tenPhim: 'Phim mẫu: Mùa Hạ Năm Ấy', danhGia: 8, sapChieu: true, daysFromNow: 10 },
  { tenPhim: 'Phim mẫu: Đảo Sương Mù', danhGia: 6, sapChieu: true, daysFromNow: 21 },
];

function getPlaceholderImage(text, size = '300x450') {
  return `https://placehold.co/${size}?text=${encodeURIComponent(text)}`;
}

function daysFromToday(days) {
  return new Date(Date.now() + days * DAY_IN_MS);
}

function buildSeats() {
  return SEAT_ROWS.flatMap((row) =>
    Array.from({ length: SEATS_PER_ROW }, (_, index) => ({
      tenGhe: `${row}${index + 1}`,
      loaiGhe: VIP_ROWS.includes(row) ? 'Vip' : 'Thuong',
    })),
  );
}

function buildCluster({ tenCumRap, diaChi }) {
  return {
    tenCumRap,
    diaChi,
    rapPhim: {
      create: ['Rạp 1', 'Rạp 2'].map((tenRap) => ({ tenRap, ghe: { create: buildSeats() } })),
    },
  };
}

async function seedUsers() {
  const matKhau = await bcrypt.hash(process.env.SEED_PASSWORD, BCRYPT_ROUNDS);

  await prisma.nguoiDung.createMany({
    data: [
      { taiKhoan: 'admin', hoTen: 'Quản Trị Viên', email: 'admin@example.com', soDt: '0900000001', matKhau, loaiNguoiDung: 'QuanTri' },
      { taiKhoan: 'khachhang', hoTen: 'Khách Hàng Mẫu', email: 'khachhang@example.com', soDt: '0900000002', matKhau },
    ],
  });
}

async function seedCinemas() {
  for (const { clusters, ...system } of cinemaSystems) {
    await prisma.heThongRap.create({
      data: {
        ...system,
        logo: getPlaceholderImage(system.maHeThongRap, '100x100'),
        cumRap: { create: clusters.map(buildCluster) },
      },
    });
  }
}

async function seedMovies() {
  for (const { daysFromNow, ...movie } of movies) {
    await prisma.phim.create({
      data: {
        ...movie,
        hinhAnh: getPlaceholderImage(movie.tenPhim),
        moTa: `Nội dung mẫu của ${movie.tenPhim}.`,
        ngayKhoiChieu: daysFromToday(daysFromNow),
        banner: movie.hot
          ? { create: { hinhAnh: getPlaceholderImage(movie.tenPhim, '1200x400') } }
          : undefined,
      },
    });
  }
}

async function seedShowtimes() {
  const showingMovies = await prisma.phim.findMany({ where: { dangChieu: true } });
  const rooms = await prisma.rapPhim.findMany();

  const showtimes = rooms.flatMap((room, index) =>
    [1, 2].map((days) => ({
      maRap: room.maRap,
      maPhim: showingMovies[index % showingMovies.length].maPhim,
      ngayGioChieu: daysFromToday(days),
      giaVe: 75000,
    })),
  );

  await prisma.lichChieu.createMany({ data: showtimes });
}

async function seedBookings() {
  const showtime = await prisma.lichChieu.findFirstOrThrow();
  const seats = await prisma.ghe.findMany({ where: { maRap: showtime.maRap }, take: 2 });

  await prisma.datVe.createMany({
    data: seats.map(({ maGhe }) => ({
      taiKhoan: 'khachhang',
      maLichChieu: showtime.maLichChieu,
      maGhe,
    })),
  });
}

async function main() {
  if (!process.env.SEED_PASSWORD) {
    throw new Error('Cần khai báo SEED_PASSWORD trong .env');
  }

  if (await prisma.phim.count()) {
    console.log('Database đã có dữ liệu, bỏ qua seed.');
    return;
  }

  await seedUsers();
  await seedCinemas();
  await seedMovies();
  await seedShowtimes();
  await seedBookings();
  console.log('Seed dữ liệu mẫu thành công.');
}

try {
  await main();
} finally {
  await prisma.$disconnect();
}
