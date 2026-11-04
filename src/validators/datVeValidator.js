import { z } from 'zod';
import { dateTimeSchema, idSchema, moneySchema } from './commonValidator.js';

const MAX_TICKETS_PER_BOOKING = 10;

function hasNoDuplicateSeats(tickets) {
  return new Set(tickets.map(({ maGhe }) => maGhe)).size === tickets.length;
}

export const seatMapQuerySchema = z.object({
  MaLichChieu: idSchema,
});

export const bookingSchema = z.object({
  maLichChieu: idSchema,
  danhSachVe: z
    .array(z.object({ maGhe: idSchema }))
    .min(1)
    .max(MAX_TICKETS_PER_BOOKING)
    .refine(hasNoDuplicateSeats, { error: 'Danh sách vé có ghế bị trùng' }),
});

export const createShowtimeSchema = z.object({
  maPhim: idSchema,
  maRap: idSchema,
  ngayChieuGioChieu: dateTimeSchema,
  giaVe: moneySchema,
});
