import * as phimService from '../services/phimService.js';
import { sendSuccess } from '../utils/response.js';
import { parseOrThrow } from '../utils/validate.js';
import {
  createMovieSchema,
  movieDateRangeSchema,
  movieIdQuerySchema,
  movieImageQuerySchema,
  moviePageSchema,
  movieSearchSchema,
  updateMovieSchema,
} from '../validators/phimValidator.js';

export async function getBanners(req, res) {
  sendSuccess(res, await phimService.getBanners());
}

export async function getMovies(req, res) {
  const filter = parseOrThrow(movieSearchSchema, req.query);
  sendSuccess(res, await phimService.getMovies(filter));
}

export async function getMoviePage(req, res) {
  const filter = parseOrThrow(moviePageSchema, req.query);
  sendSuccess(res, await phimService.getMoviePage(filter));
}

export async function getMoviePageByDate(req, res) {
  const filter = parseOrThrow(movieDateRangeSchema, req.query);
  sendSuccess(res, await phimService.getMoviePageByDate(filter));
}

export async function getMovieDetail(req, res) {
  const { MaPhim } = parseOrThrow(movieIdQuerySchema, req.query);
  sendSuccess(res, await phimService.getMovieDetail(MaPhim));
}

export async function createMovie(req, res) {
  const movie = parseOrThrow(createMovieSchema, req.body);
  sendSuccess(res, await phimService.createMovie(movie, req.file), 'Thêm phim thành công');
}

export async function updateMovie(req, res) {
  const changes = parseOrThrow(updateMovieSchema, req.body);
  sendSuccess(res, await phimService.updateMovie(changes, req.file), 'Cập nhật phim thành công');
}

export async function updateMovieImage(req, res) {
  const { tenPhim } = parseOrThrow(movieImageQuerySchema, req.query);
  sendSuccess(res, await phimService.updateMovieImageByName(tenPhim, req.file), 'Cập nhật ảnh thành công');
}

export async function deleteMovie(req, res) {
  const { MaPhim } = parseOrThrow(movieIdQuerySchema, req.query);
  await phimService.deleteMovie(MaPhim);
  sendSuccess(res, null, 'Xoá phim thành công');
}
