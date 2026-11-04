import { Router } from 'express';
import prisma from '../config/prisma.js';
import quanLyNguoiDungRoute from './quanLyNguoiDungRoute.js';
import quanLyPhimRoute from './quanLyPhimRoute.js';

const router = Router();

router.get('/health', async (req, res) => {
  await prisma.$queryRaw`SELECT 1`;
  res.json({ status: 'ok' });
});

router.use('/QuanLyNguoiDung', quanLyNguoiDungRoute);
router.use('/QuanLyPhim', quanLyPhimRoute);

export default router;
