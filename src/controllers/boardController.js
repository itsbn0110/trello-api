// example controller
import { StatusCodes } from 'http-status-codes';

const createNew = async (req, res, next) => {
  try {
    console.log('req.body', req.body);
    res.status(StatusCodes.CREATED).json({ message: 'Created New from Controller' });
  } catch (e) {
    next(e);
  }
};

export const boardController = {
  createNew
};
