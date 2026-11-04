import { LoaiNguoiDung } from '@prisma/client';
import { z } from 'zod';
import { paginationSchema } from './commonValidator.js';

const BCRYPT_MAX_BYTES = 72;

const taiKhoanSchema = z.string().trim().min(3).max(50).regex(/^[a-zA-Z0-9_.-]+$/);

export const loginSchema = z.object({
  taiKhoan: z.string().min(1),
  matKhau: z.string().min(1),
});

export const registerSchema = z.object({
  taiKhoan: taiKhoanSchema,
  matKhau: z.string().min(6).refine((value) => Buffer.byteLength(value) <= BCRYPT_MAX_BYTES, {
    error: `Mật khẩu tối đa ${BCRYPT_MAX_BYTES} byte`,
  }),
  email: z.email().max(100),
  soDt: z.string().regex(/^\+?\d{9,15}$/).optional(),
  hoTen: z.string().trim().min(1).max(100),
});

export const createUserSchema = registerSchema.extend({
  maLoaiNguoiDung: z.enum(LoaiNguoiDung).optional(),
});

export const updateUserSchema = createUserSchema.partial().required({ taiKhoan: true });

export const userSearchSchema = z.object({
  tuKhoa: z.string().trim().optional(),
});

export const userPageSchema = userSearchSchema.extend(paginationSchema.shape);

export const userDetailQuerySchema = z.object({
  taiKhoan: taiKhoanSchema,
});

export const deleteUserQuerySchema = z.object({
  TaiKhoan: taiKhoanSchema,
});
