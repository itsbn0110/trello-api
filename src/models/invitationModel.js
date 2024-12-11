import Joi from 'joi';
import { GET_DB } from '~/config/mongodb';
import { ObjectId } from 'mongodb';
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators';
import { INVITATION_TYPES, BOARD_INVITATION_STATUS } from '~/utils/constants';
import { userModel } from './userModel';
import { boardModel } from './boardModel';
// Define Collection (name & schema)
const INVITATION_COLLECTION_NAME = 'invitations';
const INVITATION_COLLECTION_SCHEMA = Joi.object({
  inviterId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  inviteeId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),

  type: Joi.string()
    .required()
    .valid(...Object.values(INVITATION_TYPES)),

  //  Lời mời là board thì sẽ lưu thêm dữ liệu boardInvitation - optional
  boardInvitation: Joi.object({
    boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    status: Joi.string()
      .required()
      .valid(...Object.values(BOARD_INVITATION_STATUS))
  }).optional(),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
});

const INVALID_UPDATE_FIELDS = ['_id', 'inviterId', 'inviteeId', 'type', 'createdAt'];
const validateBeforeCreate = async (data) => {
  // abortEarly : true, trả về lỗi đầu tiên gặp,lần lượt các lỗi, abortEarly: false trả về hết tất cả các lỗi trong 1 lần
  return await INVITATION_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false });
};

const createNewBoardInvitation = async (data) => {
  try {
    const validData = await validateBeforeCreate(data);

    const newInvitationToAdd = {
      ...validData,
      inviterId: new ObjectId(String(validData.inviterId)),
      inviteeId: new ObjectId(String(validData.inviteeId))
    };

    // Nếu tồn tại dữ liệu boardInvitation thì update cho cái boardId
    if (validData.boardInvitation) {
      newInvitationToAdd.boardInvitation = {
        ...validData.boardInvitation,
        boardId: new ObjectId(String(validData.boardInvitation.boardId))
      };
    }
    // Gọi insert vào DB
    const createdInvitation = await GET_DB().collection(INVITATION_COLLECTION_NAME).insertOne(newInvitationToAdd);
    return createdInvitation;
  } catch (e) {
    throw new Error(e);
  }
};

const findOneById = async (invitationId) => {
  try {
    const result = await GET_DB()
      .collection(INVITATION_COLLECTION_NAME)
      .findOne({
        _id: new ObjectId(String(invitationId))
      });
    return result;
  } catch (e) {
    throw new Error(e);
  }
};

const update = async (invitationId, updateData) => {
  try {
    Object.keys(updateData).forEach((fieldName) => {
      if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
        delete updateData[fieldName];
      }
    });

    // Đối với những dữ liệu liên quan đến ObjectId, biến đổi ở đây:
    if (updateData.boardInvitation)
      updateData.boardInvitation = {
        ...updateData.boardInvitation,
        boardId: new ObjectId(String(updateData.boardInvitation.boardId))
      };

    const result = await GET_DB()
      .collection(INVITATION_COLLECTION_NAME)
      .findOneAndUpdate(
        {
          _id: new ObjectId(String(invitationId))
        },
        {
          $set: updateData
        },
        {
          // trả về 1 bản ghi đã được cập nhật
          returnDocument: 'after'
        }
      );
    return result;
  } catch (e) {
    throw new Error(e);
  }
};

const findByUser = async (userId) => {
  try {
    // Người dược mời chính là người đang thực hiện request này
    const queryCondition = [{ inviteeId: new ObjectId(String(userId)) }, { _destroy: false }];

    const results = await GET_DB()
      .collection(INVITATION_COLLECTION_NAME)
      .aggregate([
        {
          $match: { $and: queryCondition }
        },
        {
          $lookup: {
            from: userModel.USER_COLLECTION_NAME,
            localField: 'inviterId',
            foreignField: '_id',
            as: 'inviter',
            pipeline: [{ $project: { password: 0, verifyToken: 0 } }]
          }
        },
        {
          $lookup: {
            from: userModel.USER_COLLECTION_NAME,
            localField: 'inviteeId',
            foreignField: '_id',
            as: 'invitee',
            pipeline: [{ $project: { password: 0, verifyToken: 0 } }]
          }
        },
        {
          $lookup: {
            from: boardModel.BOARD_COLLECTION_NAME,
            localField: 'boardInvitation.boardId',
            foreignField: '_id',
            as: 'board'
          }
        }
      ])
      .toArray();
    return results;
  } catch (e) {
    throw new Error(e);
  }
};
export const invitationModel = {
  INVITATION_COLLECTION_NAME,
  INVITATION_COLLECTION_SCHEMA,
  createNewBoardInvitation,
  findOneById,
  update,
  findByUser
};
