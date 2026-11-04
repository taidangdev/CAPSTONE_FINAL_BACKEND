import AppError from '../utils/AppError.js';

export function notFoundHandler(req, res, next) {
  next(new AppError(404, `Không tìm thấy ${req.method} ${req.originalUrl}`));
}

// Express chỉ nhận diện error middleware khi hàm có đủ 4 tham số
export function errorHandler(error, req, res, next) {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({ statusCode: error.statusCode, message: error.message });
    return;
  }

  console.error(error);
  res.status(500).json({ statusCode: 500, message: 'Lỗi máy chủ' });
}
