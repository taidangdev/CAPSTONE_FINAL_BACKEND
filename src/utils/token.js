import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import AppError from './AppError.js';

const ALGORITHM = 'HS256';

export function signAccessToken(taiKhoan) {
  return jwt.sign({}, env.jwtSecret, {
    subject: taiKhoan,
    algorithm: ALGORITHM,
    expiresIn: env.jwtExpiresIn,
  });
}

export function readTaiKhoanFromToken(token) {
  try {
    return jwt.verify(token, env.jwtSecret, { algorithms: [ALGORITHM] }).sub;
  } catch {
    throw new AppError(401, 'Token không hợp lệ hoặc đã hết hạn');
  }
}
