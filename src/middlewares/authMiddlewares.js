import { StatusCodes } from 'http-status-codes';
import { JwtProvider } from '~/providers/JwtProvider';
import { env } from '~/config/environment';
import ApiError from '~/utils/ApiError';
// Middleware này sẽ đảm nhiệm việc quan trọng:
// xác thực cái JWT accessToken nhận được từ phía BE có hợp lệ hay không

const isAuthorized = async (req, res, next) => {
  // Lấy accessToken nằm trong request cookies phía client - withCredentials trong file authorizeAxios
  const clientAccessToken = req.cookies?.accessToken;
  // Nếu như cái clientAccessToken không tồn tại thì trả về lỗi luôn
  if (!clientAccessToken) {
    next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthoried: (token not found)'));
    return;
  }

  try {
    // B1: Thực hiện giải mã token xem nó có hợp lệ hay là không
    const accessTokenDecoded = await JwtProvider.verifyToken(clientAccessToken, env.ACCESS_TOKEN_SECRET_SIGNATURE);

    // B2: Quan trọng : Nếu như cái token hợp lệ, thì sẽ cần phải lưu thông tin giải mã được
    // vào cái req.jwtDecoded, để sử dụng cho các tầng cần xử lí phía sau
    req.jwtDecoded = accessTokenDecoded;
    // B3: Cho phép cái request đi tiếp
    next();
  } catch (e) {
    // Nếu cái accessToken nó bị hết hạn thì mình cần trả về một cái mã lỗi - 410 cho phía FE biết
    // để gọi api refreshToken

    if (e?.message?.includes('jwt expired')) {
      next(new ApiError(StatusCodes.GONE, 'Need to refresh token.'));
      return;
    }
    // Nếu như cái accessToken nó không hợp lệ do bất kỳ điều gì khác vụ hết hạn thì chúng ta
    // cứ thẳng tay trả về mã 401 cho phí FE gọi api sign_out luôn
    next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized!'));
  }
};

export const authMiddleware = { isAuthorized };
