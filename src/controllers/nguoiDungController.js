import * as nguoiDungService from '../services/nguoiDungService.js';
import { sendSuccess } from '../utils/response.js';
import { parseOrThrow } from '../utils/validate.js';
import {
  createUserSchema,
  deleteUserQuerySchema,
  loginSchema,
  registerSchema,
  updateUserSchema,
  userDetailQuerySchema,
  userPageSchema,
  userSearchSchema,
} from '../validators/nguoiDungValidator.js';

export function getUserTypes(req, res) {
  sendSuccess(res, nguoiDungService.getUserTypes());
}

export async function login(req, res) {
  const credentials = parseOrThrow(loginSchema, req.body);
  sendSuccess(res, await nguoiDungService.login(credentials), 'Đăng nhập thành công');
}

export async function register(req, res) {
  const newUser = parseOrThrow(registerSchema, req.body);
  sendSuccess(res, await nguoiDungService.createUser(newUser), 'Đăng ký thành công');
}

export async function getUsers(req, res) {
  const filter = parseOrThrow(userSearchSchema, req.query);
  sendSuccess(res, await nguoiDungService.getUsers(filter));
}

export async function getUserPage(req, res) {
  const filter = parseOrThrow(userPageSchema, req.query);
  sendSuccess(res, await nguoiDungService.getUserPage(filter));
}

export async function getAccountInfo(req, res) {
  sendSuccess(res, await nguoiDungService.getAccountInfo(req.user.taiKhoan));
}

export async function getUserDetail(req, res) {
  const { taiKhoan } = parseOrThrow(userDetailQuerySchema, req.query);
  sendSuccess(res, await nguoiDungService.getUserDetail(taiKhoan, req.user));
}

export async function createUser(req, res) {
  const newUser = parseOrThrow(createUserSchema, req.body);
  sendSuccess(res, await nguoiDungService.createUser(newUser), 'Thêm người dùng thành công');
}

export async function updateUser(req, res) {
  const changes = parseOrThrow(updateUserSchema, req.body);
  sendSuccess(res, await nguoiDungService.updateUser(changes, req.user), 'Cập nhật thành công');
}

export async function deleteUser(req, res) {
  const { TaiKhoan } = parseOrThrow(deleteUserQuerySchema, req.query);
  await nguoiDungService.deleteUser(TaiKhoan, req.user);
  sendSuccess(res, null, 'Xoá người dùng thành công');
}
