import { StatusCodes } from 'http-status-codes';
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
export const userController = {
  createNew,
  verifyAccount,
  login
};
