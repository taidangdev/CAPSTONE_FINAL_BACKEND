import { Router } from 'express';
import * as datVeController from '../controllers/datVeController.js';
import { authenticate, requireAdmin } from '../middlewares/auth.js';

const router = Router();

router.get('/LayDanhSachPhongVe', datVeController.getSeatMap);
router.post('/DatVe', authenticate, datVeController.bookTickets);
router.post('/TaoLichChieu', authenticate, requireAdmin, datVeController.createShowtime);

export default router;
