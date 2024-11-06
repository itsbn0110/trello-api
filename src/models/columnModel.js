import Joi from 'joi';
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators';
import { GET_DB } from '~/config/mongodb';
import { ObjectId } from 'mongodb';
// Define Collection (name & schema)
const COLUMN_COLLECTION_NAME = 'columns';
const COLUMN_COLLECTION_SCHEMA = Joi.object({
  boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  title: Joi.string().required().min(3).max(50).trim().strict(),

  cardOrderIds: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)).default([]),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
});

const INVALID_UPDATE_FIELDS = ['_id', 'createdAt', 'boardId'];

const validateBeforeCreate = async (data) => {
  // abortEarly : true, trả về lỗi đầu tiên gặp,lần lượt các lỗi, abortEarly: false trả về hết tất cả các lỗi trong 1 lần
  return await COLUMN_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false });
};

const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data);
    const newValidData = {
      ...validData,
      boardId: new ObjectId(String(validData.boardId))
    };
    return await GET_DB().collection(COLUMN_COLLECTION_NAME).insertOne(newValidData);
  } catch (e) {
    throw new Error(e);
  }
};

const findOneById = async (id) => {
  try {
    const result = await GET_DB()
      .collection(COLUMN_COLLECTION_NAME)
      .findOne({
        _id: new ObjectId(String(id))
      });
    return result;
  } catch (e) {
    throw new Error(e);
  }
};

const pushCardOrderIds = async (card) => {
  try {
    const result = await GET_DB()
      .collection(COLUMN_COLLECTION_NAME)
      .findOneAndUpdate(
        {
          _id: new ObjectId(String(card.columnId))
        },
        { $push: { cardOrderIds: new ObjectId(String(card._id)) } },
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

const update = async (columnId, updateData) => {
  try {
    Object.keys(updateData).forEach((fieldName) => {
      if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
        delete updateData[fieldName];
      }
    });

    // Đối với những dữ liệu liên quan đến ObjectId, biến đổi ở đây:
    if (updateData.cardOrderIds) {
      updateData.cardOrderIds = updateData.cardOrderIds.map((_id) => new ObjectId(String(_id)));
    }
    const result = await GET_DB()
      .collection(COLUMN_COLLECTION_NAME)
      .findOneAndUpdate(
        {
          _id: new ObjectId(String(columnId))
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
export const columnModel = {
  COLUMN_COLLECTION_NAME,
  COLUMN_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  pushCardOrderIds,
  update
};
