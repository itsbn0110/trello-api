// example controller
import { StatusCodes } from 'http-status-codes';
import { cardService } from '~/services/cardService';
const createNew = async (req, res, next) => {
  try {
    const createdCard = await cardService.createNew(req.body);
    res.status(StatusCodes.CREATED).json(createdCard);
  } catch (e) {
    next(e);
  }
};

export const cardController = {
  createNew
};
