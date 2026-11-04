import multer from 'multer';
import AppError from '../utils/AppError.js';
import { detectImageExtension } from '../utils/imageType.js';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_BYTES, files: 1 },
});

function verifyImage({ isRequired }) {
  return (req, res, next) => {
    if (!req.file && isRequired) {
      throw new AppError(400, 'Vui lòng chọn hình ảnh');
    }
    if (req.file && !detectImageExtension(req.file.buffer)) {
      throw new AppError(400, 'Chỉ chấp nhận ảnh JPG, PNG, GIF hoặc WEBP');
    }
    next();
  };
}

export function uploadRequiredImage(fieldName) {
  return [upload.single(fieldName), verifyImage({ isRequired: true })];
}

export function uploadOptionalImage(fieldName) {
  return [upload.single(fieldName), verifyImage({ isRequired: false })];
}
