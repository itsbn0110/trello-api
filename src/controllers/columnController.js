// example controller
import { StatusCodes } from 'http-status-codes';
import { columnService } from '~/services/columnService';
const createNew = async (req, res, next) => {
  try {
    const createdColumn = await columnService.createNew(req.body);
    res.status(StatusCodes.CREATED).json(createdColumn);
  } catch (e) {
    next(e);
  }
};

export const columnController = {
  createNew
};
