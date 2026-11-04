import { Router } from 'express';
import * as nguoiDungController from '../controllers/nguoiDungController.js';
import { authenticate, requireAdmin } from '../middlewares/auth.js';

const router = Router();

router.get('/LayDanhSachLoaiNguoiDung', nguoiDungController.getUserTypes);
router.post('/DangNhap', nguoiDungController.login);
router.post('/DangKy', nguoiDungController.register);

router.get('/LayDanhSachNguoiDung', authenticate, requireAdmin, nguoiDungController.getUsers);
router.get('/TimKiemNguoiDung', authenticate, requireAdmin, nguoiDungController.getUsers);
router.get('/LayDanhSachNguoiDungPhanTrang', authenticate, requireAdmin, nguoiDungController.getUserPage);
router.get('/TimKiemNguoiDungPhanTrang', authenticate, requireAdmin, nguoiDungController.getUserPage);

router.post('/ThongTinTaiKhoan', authenticate, nguoiDungController.getAccountInfo);
router.post('/LayThongTinNguoiDung', authenticate, nguoiDungController.getUserDetail);
router.post('/ThemNguoiDung', authenticate, requireAdmin, nguoiDungController.createUser);
router.put('/CapNhatThongTinNguoiDung', authenticate, nguoiDungController.updateUser);
router.post('/CapNhatThongTinNguoiDung', authenticate, nguoiDungController.updateUser);
router.delete('/XoaNguoiDung', authenticate, requireAdmin, nguoiDungController.deleteUser);

export default router;
