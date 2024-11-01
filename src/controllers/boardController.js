// example controller
import { StatusCodes } from 'http-status-codes';
import { boardService } from '~/services/boardService';
const createNew = async (req, res, next) => {
  try {
    // console.log('req.body', req.body);

    const createdBoard = await boardService.createNew(req.body);
    res.status(StatusCodes.CREATED).json(createdBoard);
  } catch (e) {
    next(e);
  }
};

export const boardController = {
  createNew
};
