/* eslint-disable no-useless-catch */
import { boardModel } from '~/models/boardModel';
import { StatusCodes } from 'http-status-codes';
import ApiError from '~/utils/ApiError';
import { pickUser } from '~/utils/formatters';
import { userModel } from '~/models/userModel';
import { invitationModel } from '~/models/invitationModel';
import { INVITATION_TYPES, BOARD_INVITATION_STATUS } from '~/utils/constants';
// example Service
const createNewBoardInvitation = async (reqBody, inviterId) => {
  try {
    // Người đi mời: chính là người đang request
    const inviter = await userModel.findOneById(inviterId);
    // Người được mời : lấy theo email nhận từ phía FE
    const invitee = await userModel.findOneByEmail(reqBody.inviteeEmail);
    // Tìm luôn cái board ra để lấy data xử lí
    const board = await boardModel.findOneById(reqBody.boardId);

    // Nếu không tồn tại 1 trong 3 thì reject luôn
    if (!invitee || !inviter || !board) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Inviter,Invitee or Board not found!');
    }

    // Tạo data cần thiết để lưu vào trong DB
    // Có thể thử bỏ hoặc làm sai lệch type, boardInvitation, status để test xem Model validate ok chưa.

    const newInvitationData = {
      inviterId,
      inviteeId: invitee._id.toString(), // Chuyển từ ObjectId về string vì sang bên Model có check lại data ở hàm create
      type: INVITATION_TYPES.BOARD_INVITATION,
      boardInvitation: {
        boardId: board._id.toString(),
        status: BOARD_INVITATION_STATUS.PENDING
      }
    };

    // Gọi sang Model để lưu vào DB
    const createdInvitation = await invitationModel.createNewBoardInvitation(newInvitationData);
    const getInvitation = await invitationModel.findOneById(createdInvitation.insertedId.toString());

    // Ngoài thông tin của cái board invitation mới tạo thì trả về đủ cả luôn board, inviter, invitee cho FE
    // thoải mái xử lí
    const resInvitation = {
      ...getInvitation,
      board,
      inviter: pickUser(inviter),
      invitee: pickUser(invitee)
    };
    return resInvitation;
  } catch (e) {
    throw e;
  }
};

export const invitationService = {
  createNewBoardInvitation
};
