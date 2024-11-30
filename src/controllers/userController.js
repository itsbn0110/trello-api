import { StatusCodes } from 'http-status-codes';
import { userService } from '~/services/userService';
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

    // Xử lí trả về http only cookie cho phía trình duyệt

    console.log(result);
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
