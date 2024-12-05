// example routes
import express from 'express';
import { boardValidation } from '~/validations/boardValidation';
import { boardController } from '~/controllers/boardController';
import { authMiddleware } from '~/middlewares/authMiddlewares';
const Router = express.Router();

Router.route('/')
  .get(authMiddleware.isAuthorized, boardController.getBoards)
  .post(authMiddleware.isAuthorized, boardValidation.createNew, boardController.createNew);

Router.route('/:id')
  .get(authMiddleware.isAuthorized, boardController.getDetails)
  .put(authMiddleware.isAuthorized, boardValidation.update, boardController.update);

// API hỗ trợ di chuyển card giữa các column khác nhau

Router.route('/supports/moving_card').put(
  authMiddleware.isAuthorized,
  boardValidation.moveCardToDifferentColumn,
  boardController.moveCardToDifferentColumn
);
export const boardRoute = Router;
