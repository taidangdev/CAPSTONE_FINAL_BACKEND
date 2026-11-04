import { z } from 'zod';
import { dateSchema, idSchema, paginationSchema } from './commonValidator.js';

const movieFieldsSchema = z.object({
  tenPhim: z.string().trim().min(1).max(255),
  trailer: z.httpUrl().max(255).optional(),
  moTa: z.string().max(10000).optional(),
  ngayKhoiChieu: dateSchema,
  danhGia: z.coerce.number().int().min(0).max(10).optional(),
  hot: z.stringbool().optional(),
  dangChieu: z.stringbool().optional(),
  sapChieu: z.stringbool().optional(),
});

export const createMovieSchema = movieFieldsSchema;

export const updateMovieSchema = movieFieldsSchema.partial().extend({ maPhim: idSchema });

export const movieSearchSchema = z.object({
  tenPhim: z.string().trim().optional(),
});

export const moviePageSchema = movieSearchSchema.extend(paginationSchema.shape);

export const movieDateRangeSchema = moviePageSchema.extend({
  tuNgay: dateSchema.optional(),
  denNgay: dateSchema.optional(),
});

export const movieIdQuerySchema = z.object({
  MaPhim: idSchema,
});

export const movieImageQuerySchema = z.object({
  tenPhim: z.string().trim().min(1),
});
