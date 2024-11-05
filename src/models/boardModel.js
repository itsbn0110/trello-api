// example model
import Joi from 'joi';
import { ObjectId, ReturnDocument } from 'mongodb';
import { GET_DB } from '~/config/mongodb';
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators';
import { BOARD_TYPES } from '~/utils/constants';

import { columnModel } from './columnModel';
import { cardModel } from './cardModel';
// Define Collection (Name & Schema)
const BOARD_COLLECTION_NAME = 'boards';
const BOARD_COLLECTION_SCHEMA = Joi.object({
  title: Joi.string().required().min(3).max(50).trim().strict(),
  slug: Joi.string().required().min(3).trim().strict(),
  description: Joi.string().required().min(3).max(256).trim().strict(),
  type: Joi.string().valid(BOARD_TYPES.PUBLIC, BOARD_TYPES.PRIVATE).required(),
  columnOrderIds: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)).default([]),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
});
// Chỉ định ra những Fields mà chúng ta không muốn cho phép cập nhật
const INVALID_UPDATE_FIELDS = ['_id', 'createdAt'];
const validateBeforeCreate = async (data) => {
  // abortEarly : true, trả về lỗi đầu tiên gặp,lần lượt các lỗi, abortEarly: false trả về hết tất cả các lỗi trong 1 lần
  return await BOARD_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false });
};

const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data);
    return await GET_DB().collection(BOARD_COLLECTION_NAME).insertOne(validData);
  } catch (e) {
    throw new Error(e);
  }
};

const findOneById = async (id) => {
  try {
    const result = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .findOne({
        _id: new ObjectId(String(id))
      });
    return result;
  } catch (e) {
    throw new Error(e);
  }
};

// Query tổng hợp ( aggregate ) lấy toàn bộ columns và cards thuộc về boards
const getDetails = async (id) => {
  try {
    const result = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .aggregate([
        {
          $match: {
            _id: new ObjectId(String(id)),
            _destroy: false
          }
        },
        {
          $lookup: {
            from: columnModel.COLUMN_COLLECTION_NAME,
            localField: '_id',
            foreignField: 'boardId',
            as: 'columns'
          }
        },
        {
          $lookup: {
            from: cardModel.CARD_COLLECTION_NAME,
            localField: '_id',
            foreignField: 'boardId',
            as: 'cards'
          }
        }
      ])
      .toArray();
    return result[0] || null;
  } catch (e) {
    throw new Error(e);
  }
};
// Nhiệm vụ của func này là push 1 giá trị columnId vào mảng columnOrderIds
const pushColumnOrderIds = async (column) => {
  try {
    const result = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .findOneAndUpdate(
        {
          _id: new ObjectId(String(column.boardId))
        },
        { $push: { columnOrderIds: new ObjectId(String(column._id)) } },
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

const update = async (boardId, updateData) => {
  try {
    Object.keys(updateData).forEach((fieldName) => {
      if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
        delete updateData[fieldName];
      }
    });
    const result = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .findOneAndUpdate(
        {
          _id: new ObjectId(String(boardId))
        },
        { $set: updateData },
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

export const boardModel = {
  BOARD_COLLECTION_NAME,
  BOARD_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  getDetails,
  pushColumnOrderIds,
  update
};

// boardId :6724facbf02917d1414ee601
// column: 6727ae8b7b75e2ec5ad25103
// cardId: 6727af217b75e2ec5ad2510a
