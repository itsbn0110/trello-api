import multer from 'multer';
import { ALLOW_COMMON_FILE_TYPES, LIMIT_COMMON_FILE_SIZE } from '~/utils/validators';
import { StatusCodes } from 'http-status-codes';
import ApiError from '~/utils/ApiError';
/**
 * Hầu hết những thứ bên dưới đều có ở trong docs của multer, chỉ là tổ chức lại cho gọn gàng nhất có thể
 * https://www.npmjs.com/package/multer
 */

// Function kiểm tra loại file nào được chấp nhận

const customFileFilter = (req, file, callback) => {
  console.log('file: ', file);

  // Đối với th multer, kiểm tra kiểu file thì sử dụng mimetypes
  if (!ALLOW_COMMON_FILE_TYPES.includes(file.mimetype)) {
    const errMessage = 'File type is invalid. Only accept jpg, jpeg and png';
    return callback(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errMessage), null);
  }

  // Nếu như kiểu file hợp lệ
  return callback(null, true);
};

// Khởi tạo function upload được bọc bởi th multer
const upload = multer({
  limits: { fileSize: LIMIT_COMMON_FILE_SIZE },
  fileFilter: customFileFilter
});

export const multerUploadMiddleware = { upload };
