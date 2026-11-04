import { Router } from 'express';
import * as rapController from '../controllers/rapController.js';

const router = Router();

router.get('/LayThongTinHeThongRap', rapController.getCinemaSystems);
router.get('/LayThongTinCumRapTheoHeThong', rapController.getClustersBySystem);
router.get('/LayThongTinLichChieuHeThongRap', rapController.getSystemSchedules);
router.get('/LayThongTinLichChieuPhim', rapController.getMovieSchedule);

export default router;
