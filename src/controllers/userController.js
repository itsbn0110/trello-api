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

export const userController = {
  createNew
};
