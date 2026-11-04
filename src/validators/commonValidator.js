import { z } from 'zod';

const MAX_PAGE_SIZE = 100;
const MAX_PAGE_NUMBER = 1_000_000;
const MAX_INT32 = 2_147_483_647;
const DATE_PATTERNS = [
  /^(?<day>\d{2})\/(?<month>\d{2})\/(?<year>\d{4})$/,
  /^(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})$/,
];
const TIME_PATTERN = /^(?<hour>[01]\d|2[0-3]):(?<minute>[0-5]\d)(?::(?<second>[0-5]\d))?$/;
const VIETNAM_UTC_OFFSET_HOURS = 7;

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

// Thời gian không kèm múi giờ được hiểu là giờ Việt Nam
function parseLocalDateTime(value) {
  const [datePart, timePart] = value.split(' ');
  const date = parseDate(datePart);
  const time = TIME_PATTERN.exec(timePart ?? '')?.groups;
  if (!date || !time) {
    return null;
  }

  const hours = Number(time.hour) - VIETNAM_UTC_OFFSET_HOURS;
  date.setUTCHours(hours, Number(time.minute), Number(time.second ?? 0));
  return date;
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

const localDateTimeSchema = z.string().transform((value, context) => {
  const dateTime = parseLocalDateTime(value);
  if (!dateTime) {
    context.addIssue({ code: 'custom', message: 'Thời gian không hợp lệ' });
    return z.NEVER;
  }
  return dateTime;
});

const isoDateTimeSchema = z.iso.datetime({ offset: true }).transform((value) => new Date(value));

export const dateTimeSchema = z.union([isoDateTimeSchema, localDateTimeSchema], {
  error: 'Thời gian không hợp lệ, dùng dd/MM/yyyy HH:mm:ss hoặc ISO 8601',
});

export const paginationSchema = z.object({
  soTrang: z.coerce.number().int().min(1).max(MAX_PAGE_NUMBER).default(1),
  soPhanTuTrenTrang: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(20),
});
