import { z } from 'zod';

const MAX_PAGE_SIZE = 100;
const MAX_PAGE_NUMBER = 1_000_000;
const MAX_INT32 = 2_147_483_647;
const DATE_PATTERNS = [
  /^(?<day>\d{2})\/(?<month>\d{2})\/(?<year>\d{4})$/,
  /^(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})$/,
];

function parseDate(value) {
  const parts = DATE_PATTERNS.map((pattern) => pattern.exec(value)).find(Boolean)?.groups;
  if (!parts) {
    return null;
  }

  const [year, month, day] = [parts.year, parts.month, parts.day].map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  const isRealDate = date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
  return isRealDate ? date : null;
}

export const idSchema = z.coerce.number().int().positive().max(MAX_INT32);

export const moneySchema = z.coerce.number().int().min(0).max(MAX_INT32);

export const dateSchema = z.string().transform((value, context) => {
  const date = parseDate(value);
  if (!date) {
    context.addIssue({ code: 'custom', message: 'Ngày không hợp lệ, dùng dd/MM/yyyy hoặc yyyy-MM-dd' });
    return z.NEVER;
  }
  return date;
});

export const paginationSchema = z.object({
  soTrang: z.coerce.number().int().min(1).max(MAX_PAGE_NUMBER).default(1),
  soPhanTuTrenTrang: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(20),
});
