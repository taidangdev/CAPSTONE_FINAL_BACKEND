import { Router } from 'express';
import prisma from '../config/prisma.js';
import quanLyDatVeRoute from './quanLyDatVeRoute.js';
import quanLyNguoiDungRoute from './quanLyNguoiDungRoute.js';
import quanLyPhimRoute from './quanLyPhimRoute.js';
import quanLyRapRoute from './quanLyRapRoute.js';

const router = Router();

router.get('/health', async (req, res) => {
  await prisma.$queryRaw`SELECT 1`;
  res.json({ status: 'ok' });
});

router.use('/QuanLyNguoiDung', quanLyNguoiDungRoute);
router.use('/QuanLyPhim', quanLyPhimRoute);
router.use('/QuanLyRap', quanLyRapRoute);
router.use('/QuanLyDatVe', quanLyDatVeRoute);

export default router;
