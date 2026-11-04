import prisma from '../config/prisma.js';
import AppError from '../utils/AppError.js';
import { paginate } from '../utils/pagination.js';
import { saveImage } from './imageStorageService.js';

const MOVIE_ORDER = { maPhim: 'desc' };

function buildNameFilter(tenPhim) {
  return tenPhim ? { tenPhim: { contains: tenPhim } } : {};
}

function buildDateFilter(tuNgay, denNgay) {
  if (!tuNgay && !denNgay) {
    return {};
  }
  return { ngayKhoiChieu: { gte: tuNgay, lte: denNgay } };
}

export function getBanners() {
  return prisma.banner.findMany({ orderBy: { maBanner: 'asc' } });
}

export function getMovies({ tenPhim }) {
  return prisma.phim.findMany({ where: buildNameFilter(tenPhim), orderBy: MOVIE_ORDER });
}

export function getMoviePage({ tenPhim, ...pagination }) {
  return paginate(prisma.phim, { where: buildNameFilter(tenPhim), orderBy: MOVIE_ORDER }, pagination);
}

export function getMoviePageByDate({ tenPhim, tuNgay, denNgay, ...pagination }) {
  const where = { ...buildNameFilter(tenPhim), ...buildDateFilter(tuNgay, denNgay) };
  return paginate(prisma.phim, { where, orderBy: MOVIE_ORDER }, pagination);
}

export function getMovieDetail(maPhim) {
  return prisma.phim.findUniqueOrThrow({ where: { maPhim } });
}

export async function createMovie(movie, imageFile) {
  return prisma.phim.create({ data: { ...movie, hinhAnh: await saveImage(imageFile) } });
}

export async function updateMovie({ maPhim, ...changes }, imageFile) {
  await getMovieDetail(maPhim);

  return prisma.phim.update({
    where: { maPhim },
    data: { ...changes, hinhAnh: imageFile ? await saveImage(imageFile) : undefined },
  });
}

// Tên phim không phải khoá duy nhất nên phải từ chối khi có nhiều phim trùng tên, tránh ghi đè nhầm ảnh
export async function updateMovieImageByName(tenPhim, imageFile) {
  const movies = await prisma.phim.findMany({ where: { tenPhim }, select: { maPhim: true } });
  if (movies.length === 0) {
    throw new AppError(404, 'Không tìm thấy phim');
  }
  if (movies.length > 1) {
    throw new AppError(409, 'Có nhiều phim trùng tên, vui lòng dùng CapNhatPhimUpload');
  }

  return updateMovie({ maPhim: movies[0].maPhim }, imageFile);
}

export async function deleteMovie(maPhim) {
  await prisma.phim.delete({ where: { maPhim } });
}
