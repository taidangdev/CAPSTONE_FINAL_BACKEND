import * as datVeService from '../services/datVeService.js';
import { sendSuccess } from '../utils/response.js';
import { parseOrThrow } from '../utils/validate.js';
import { bookingSchema, createShowtimeSchema, seatMapQuerySchema } from '../validators/datVeValidator.js';

export async function getSeatMap(req, res) {
  const { MaLichChieu } = parseOrThrow(seatMapQuerySchema, req.query);
  sendSuccess(res, await datVeService.getSeatMap(MaLichChieu));
}

export async function bookTickets(req, res) {
  const booking = parseOrThrow(bookingSchema, req.body);
  sendSuccess(res, await datVeService.bookTickets(booking, req.user.taiKhoan), 'Đặt vé thành công');
}

export async function createShowtime(req, res) {
  const showtime = parseOrThrow(createShowtimeSchema, req.body);
  sendSuccess(res, await datVeService.createShowtime(showtime), 'Tạo lịch chiếu thành công');
}
