import * as rapService from '../services/rapService.js';
import { sendSuccess } from '../utils/response.js';
import { parseOrThrow } from '../utils/validate.js';
import { cinemaSystemQuerySchema, movieScheduleQuerySchema } from '../validators/rapValidator.js';

export async function getCinemaSystems(req, res) {
  const filter = parseOrThrow(cinemaSystemQuerySchema, req.query);
  sendSuccess(res, await rapService.getCinemaSystems(filter));
}

export async function getClustersBySystem(req, res) {
  const filter = parseOrThrow(cinemaSystemQuerySchema, req.query);
  sendSuccess(res, await rapService.getClustersBySystem(filter));
}

export async function getSystemSchedules(req, res) {
  const filter = parseOrThrow(cinemaSystemQuerySchema, req.query);
  sendSuccess(res, await rapService.getSystemSchedules(filter));
}

export async function getMovieSchedule(req, res) {
  const { MaPhim } = parseOrThrow(movieScheduleQuerySchema, req.query);
  sendSuccess(res, await rapService.getMovieSchedule(MaPhim));
}
