// example model
import Joi from 'joi';
import { ObjectId } from 'mongodb';
import { GET_DB } from '~/config/mongodb';
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators';
import { BOARD_TYPES } from '~/utils/constants';

import { columnModel } from './columnModel';
import { cardModel } from './cardModel';

import { pagingSkipValue } from '~/utils/algorithms';
import { userModel } from './userModel';
// Define Collection (Name & Schema)
const BOARD_COLLECTION_NAME = 'boards';
const BOARD_COLLECTION_SCHEMA = Joi.object({
  title: Joi.string().required().min(3).max(50).trim().strict(),
  slug: Joi.string().required().min(3).trim().strict(),
  description: Joi.string().required().min(3).max(256).trim().strict(),
  type: Joi.string().valid(BOARD_TYPES.PUBLIC, BOARD_TYPES.PRIVATE).required(),
  columnOrderIds: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)).default([]),
  // Những admin của cái boards
  ownerIds: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)).default([]),
  // Những thành viên của cái boards
  memberIds: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)).default([]),

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

const createNew = async (userId, data) => {
  try {
    const validData = await validateBeforeCreate(data);
    const newBoardToAdd = {
      ...validData,
      ownerIds: [new ObjectId(String(userId))]
    };
    return await GET_DB().collection(BOARD_COLLECTION_NAME).insertOne(newBoardToAdd);
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
const getDetails = async (userId, boardId) => {
  try {
    const queryCondition = [
      { _id: new ObjectId(String(boardId)) },
      { _destroy: false },
      {
        $or: [
          { ownerIds: { $all: [new ObjectId(String(userId))] } },
          { memberIds: { $all: [new ObjectId(String(userId))] } }
        ]
      }
    ];

    const result = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .aggregate([
        {
          $match: { $and: queryCondition }
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
        },

        {
          $lookup: {
            from: userModel.USER_COLLECTION_NAME,
            localField: 'ownerIds',
            foreignField: '_id',
            as: 'owners',
            //pipeline trong lookup laqf để xử lí một hoặc nhiều luồng cần thiết
            // $project để chỉ định vài field không muốn lấy về bằng cách gán nó giá trị = 0
            pipeline: [{ $project: { password: 0, verifyToken: 0 } }]
          }
        },
        {
          $lookup: {
            from: userModel.USER_COLLECTION_NAME,
            localField: 'memberIds',
            foreignField: '_id',
            as: 'members',
            pipeline: [{ $project: { password: 0, verifyToken: 0 } }]
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

// Lấy 1 phần tử columnId ra khỏi mảng columnOrderIds
// Dùng $pull trong mongodb ở trường hợp này để lấy một phần tử ra khỏi mảng rồi xóa nó đi
const pullColumnOrderIds = async (column) => {
  try {
    const result = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .findOneAndUpdate(
        {
          _id: new ObjectId(String(column.boardId))
        },
        { $pull: { columnOrderIds: new ObjectId(String(column._id)) } },
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

    if (updateData.columnOrderIds) {
      updateData.columnOrderIds = updateData.columnOrderIds.map((_id) => new ObjectId(String(_id)));
    }
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

const getBoards = async (userId, page, itemsPerPage, queryFilters) => {
  try {
    const queryCondition = [
      // Điều kiện 1: Board chưa bị xóa
      { _destroy: false },
      // Điều kiện 2: Cái th userId đang thực hiện request này nó phải thuộc vào một trong 2 cái mảng ownerIds hoặc memberIds, sử dụng toán tử $all của mongodb
      {
        $or: [
          { ownerIds: { $all: [new ObjectId(String(userId))] } },
          { memberIds: { $all: [new ObjectId(String(userId))] } }
        ]
      }
    ];

    // Xử lí query filter cho từng trường hợp search board, ví dụ sarch theo title
    if (queryFilters) {
      Object.keys(queryFilters).forEach((key) => {
        // Có phân biệt chữ hoa thường
        // queryCondition.push({ [key]: { $regex: queryFilters[key] } });
        // Không phân biệt hoa thường
        queryCondition.push({ [key]: { $regex: new RegExp(queryFilters[key], 'i') } });
      });
    }
    const query = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .aggregate(
        // Tham số thứ 1
        [
          //
          { $match: { $and: queryCondition } },
          // sort title của board theo A-Z (mặc định sẽ bị chữ B hoa đứng trước a thường (theo chuẩn mã ASCII))
          { $sort: { title: 1 } },
          // $facet để xử lí nhiều luồng trong một query
          {
            $facet: {
              // Xử lí luồng thứ 1 : Query boards
              queryBoards: [
                { $skip: pagingSkipValue(page, itemsPerPage) }, // Bỏ qua số lượng bản ghi của những page trước đó
                { $limit: itemsPerPage } // giới hạn tối đa số lượng bản ghi trả về cho một page
              ],
              // Luồng thứ 2 : Query tổng số lượng bản ghi boards trong DB và trả về vào biến countedAllBoards
              queryTotalBoards: [
                {
                  $count: 'countedAllBoards'
                }
              ]
            }
          }
        ],
        // Khai báo thêm thuộc tính collation locale 'en' để fix vụ chữ B hoa và a thường ở trên
        // https://www.mongodb.com/docs/v6.0/reference/collation/#std-label-collation-document-fields
        { collation: { locale: 'en' } }
      )
      .toArray();

    const res = query[0];

    return {
      boards: res.queryBoards || [],
      totalBoards: res.queryTotalBoards[0]?.countedAllBoards || 0
    };
  } catch (e) {
    throw new Error(e);
  }
};

const pushMemberIds = async (boardId, userId) => {
  try {
    const result = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .findOneAndUpdate(
        {
          _id: new ObjectId(String(boardId))
        },
        { $push: { memberIds: new ObjectId(String(userId)) } },
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
  pullColumnOrderIds,
  update,
  getBoards,
  pushMemberIds
};

// boardId :6724facbf02917d1414ee601
// column: 6727ae8b7b75e2ec5ad25103
// cardId: 6727af217b75e2ec5ad2510a
