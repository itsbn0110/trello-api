import { StatusCodes } from 'http-status-codes';
import ApiError from '~/utils/ApiError';
import { userService } from '~/services/userService';
import ms from 'ms';
const createNew = async (req, res, next) => {
  try {
    const createdUser = await userService.createNew(req.body);
    res.status(StatusCodes.CREATED).json(createdUser);
  } catch (e) {
    next(e);
  }
};

const verifyAccount = async (req, res, next) => {
  try {
    const result = await userService.verifyAccount(req.body);
    res.status(StatusCodes.OK).json(result);
  } catch (e) {
    next(e);
  }
};

const login = async (req, res, next) => {
  try {
    const result = await userService.login(req.body);
    /**
     * Xử lí trả về http only cookie cho phía trình duyệt
     * Về cái maxAge và thư viện ms : https://expressjs.com/en/api.html
     * Đối với cái maxAge - thời gian sống của Cookie sẽ để tối đa 14 ngày, tùy PJ. Age Cooki # Age Token
     */
    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: ms('14 days')
    });

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: ms('14 days')
    });

    res.status(StatusCodes.OK).json(result);
  } catch (e) {
    next(e);
  }
};

const logout = async (req, res, next) => {
  try {
    // Xóa cookie - đơn giản là làm ngược lại so với việc gán cookie ở login
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.status(StatusCodes.OK).json({ loggedOut: true });
  } catch (e) {
    next(e);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const result = await userService.refreshToken(req.cookies?.refreshToken);
    req.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: ms('14 days')
    });
    res.status(StatusCodes.OK).json(result);
  } catch (e) {
    next(new ApiError(StatusCodes.FORBIDDEN, 'Please Sign In! (Error from refresh Token)'));
  }
};

const update = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id;
    const userAvatarFile = req.file;
    // console.log('userAvatarfile', userAvatarFile);
    const updateUser = await userService.update(userId, req.body, userAvatarFile);
    res.status(StatusCodes.OK).json(updateUser);
  } catch (e) {
    next(e);
  }
};
export const userController = {
  createNew,
  verifyAccount,
  login,
  logout,
  refreshToken,
  update
};
