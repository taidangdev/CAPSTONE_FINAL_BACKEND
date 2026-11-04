import { z } from 'zod';
import { idSchema } from './commonValidator.js';

export const cinemaSystemQuerySchema = z.object({
  maHeThongRap: z.string().trim().min(1).max(50).optional(),
});

export const movieScheduleQuerySchema = z.object({
  MaPhim: idSchema,
});
