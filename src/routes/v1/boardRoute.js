// example routes
import express from 'express';
import { StatusCodes } from 'http-status-codes';
import { boardValidation } from '~/validations/boardValidation';
import { boardController } from '~/controllers/boardController';
const Router = express.Router();

Router.route('/')
  .get((req, res) => {
    res.status(StatusCodes.OK).json({ message: 'APIs get list borads' });
  })
  .post(boardValidation.createNew, boardController.createNew);

Router.route('/:id').get(boardController.getDetails).put(boardValidation.update, boardController.update);

// API hỗ trợ di chuyển card giữa các column khác nhau

Router.route('/supports/moving_card').put(boardValidation.moveCardToDifferentColumn, boardController.moveCardToDifferentColumn);
export const boardRoute = Router;
