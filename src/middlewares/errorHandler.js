import AppError from '../utils/AppError.js';
import { buildResponseBody } from '../utils/response.js';

const KNOWN_ERRORS_BY_CODE = {
  P2002: { statusCode: 409, message: 'Dữ liệu đã tồn tại' },
  P2003: { statusCode: 409, message: 'Không thể thực hiện vì còn dữ liệu liên quan' },
  P2025: { statusCode: 404, message: 'Không tìm thấy dữ liệu' },
};

function resolveKnownError(error) {
  if (error instanceof AppError) {
    return error;
  }
  if (error.type === 'entity.parse.failed') {
    return { statusCode: 400, message: 'Body không phải JSON hợp lệ' };
  }
  return KNOWN_ERRORS_BY_CODE[error.code];
}

export function notFoundHandler(req, res, next) {
  next(new AppError(404, `Không tìm thấy ${req.method} ${req.originalUrl}`));
}

// Express chỉ nhận diện error middleware khi hàm có đủ 4 tham số
export function errorHandler(error, req, res, next) {
  const knownError = resolveKnownError(error);
  if (knownError) {
    res.status(knownError.statusCode).json(buildResponseBody(knownError.statusCode, knownError.message));
    return;
  }

  console.error(error);
  res.status(500).json(buildResponseBody(500, 'Lỗi máy chủ'));
}
