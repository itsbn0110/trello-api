// example controller
import { StatusCodes } from 'http-status-codes';
import { invitationService } from '~/services/invitationService';
const createNewBoardInvitation = async (req, res, next) => {
  try {
    // User thực hiện request này chính là Inviter - người đi mời
    const inviterId = req.jwtDecoded._id;
    const resInvitation = await invitationService.createNewBoardInvitation(req.body, inviterId);
    res.status(StatusCodes.CREATED).json(resInvitation);
  } catch (e) {
    next(e);
  }
};

export const invitationController = {
  createNewBoardInvitation
};
