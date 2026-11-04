import { Router } from 'express';
import * as phimController from '../controllers/phimController.js';
import { authenticate, requireAdmin } from '../middlewares/auth.js';
import { uploadOptionalImage, uploadRequiredImage } from '../middlewares/uploadImage.js';

const router = Router();

router.get('/LayDanhSachBanner', phimController.getBanners);
router.get('/LayDanhSachPhim', phimController.getMovies);
router.get('/LayDanhSachPhimPhanTrang', phimController.getMoviePage);
router.get('/LayDanhSachPhimTheoNgay', phimController.getMoviePageByDate);
router.get('/LayThongTinPhim', phimController.getMovieDetail);

router.post('/ThemPhimUploadHinh', authenticate, requireAdmin, uploadRequiredImage('hinhAnh'), phimController.createMovie);
router.post('/CapNhatPhimUpload', authenticate, requireAdmin, uploadOptionalImage('hinhAnh'), phimController.updateMovie);
router.post('/', authenticate, requireAdmin, uploadRequiredImage('file'), phimController.updateMovieImage);

router.delete('/XP', authenticate, requireAdmin, phimController.deleteMovie);
router.delete('/XoaPhim', authenticate, requireAdmin, phimController.deleteMovie);

export default router;
