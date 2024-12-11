import express from 'express';
import { invitationController } from '~/controllers/invitationController';
import { invitationValidation } from '~/validations/invitationValidation';
import { authMiddleware } from '~/middlewares/authMiddlewares';
const Router = express.Router();

Router.route('/board').post(
  authMiddleware.isAuthorized,
  invitationValidation.createNewBoardInvitation,
  invitationController.createNewBoardInvitation
);

// Get invitations by User
Router.route('/').get(authMiddleware.isAuthorized, invitationController.getInvitations);
Router.route('/board/:invitationId').put(authMiddleware.isAuthorized, invitationController.updateBoardInvitations);
export const invitationRoute = Router;
