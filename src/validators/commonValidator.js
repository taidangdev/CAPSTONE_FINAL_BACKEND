import { z } from 'zod';

const MAX_PAGE_SIZE = 100;

export const paginationSchema = z.object({
  soTrang: z.coerce.number().int().min(1).default(1),
  soPhanTuTrenTrang: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(20),
});
