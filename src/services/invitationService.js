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

const getInvitations = async (userId) => {
  try {
    const getInvitations = await invitationModel.findByUser(userId);
    //  Vì các dữ liệu inviter,invitee và board là đang ở giá trị mảng 1 phần tử nếu lấy ra được
    // nên chúng ta biến đổi nó về JsonObject trc khi trả về phía FE
    const resInivitations = getInvitations.map((i) => ({
      ...i,
      inviter: i.inviter[0] || {},
      invitee: i.invitee[0] || {},
      board: i.board[0] || {}
    }));
    return resInivitations;
  } catch (e) {
    throw e;
  }
};

const updateBoardInvitations = async (userId, invitationId, status) => {
  try {
    // Tìm bản ghi invitation trong model
    const getInvitation = await invitationModel.findOneById(invitationId);
    if (!getInvitation) throw new ApiError(StatusCodes.NOT_FOUND, 'Invitation not found!');
    //  Sau khi có Invitation rồi thì lấy full thông tin của board

    const boardId = getInvitation.boardInvitation.boardId;
    const getBoard = await boardModel.findOneById(boardId);
    if (!getBoard) throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found!');

    // Kiểm tra xem nếu status là ACEPTED join board mà cái thằng invitee đã là owner hoặc member của board rồi thì trả về thông báo lỗi luôn
    // Note: 2 mảng memberIds và ownerIds của board nó đang là kiểu dữ liệu ObjectId nến cho nó về string hết luôn để check
    const boardOwnerAndMemberIds = [...getBoard.ownerIds, ...getBoard.memberIds].toString();
    if (status === BOARD_INVITATION_STATUS.ACCEPTED && boardOwnerAndMemberIds.includes(userId)) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'You are already a member of this board!');
    }
    const updateData = {
      boardInvitation: {
        ...getInvitation.boardInvitation,
        status
      }
    };
    // B1: Cập nhật lại status trong bản ghi Invitation
    const updatedInvitation = await invitationModel.update(invitationId, updateData);
    // B2: Nếu trường hợp Accept một lời mới thành công, thì cần phải thêm thông tin của th user (userId) vào bản ghi memberIds trong collection board
    if (updatedInvitation.boardInvitation.status === BOARD_INVITATION_STATUS.ACCEPTED) {
      await boardModel.pushMemberIds(boardId, userId);
    }
    return updatedInvitation;
  } catch (e) {
    throw e;
  }
};
export const invitationService = {
  createNewBoardInvitation,
  getInvitations,
  updateBoardInvitations
};
