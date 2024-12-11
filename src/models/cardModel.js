import Joi from 'joi';
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE, EMAIL_RULE, EMAIL_RULE_MESSAGE } from '~/utils/validators';
import { GET_DB } from '~/config/mongodb';
import { ObjectId } from 'mongodb';
import { CARD_MEMBER_ACTIONS } from '~/utils/constants';
// Define Collection (name & schema)
const CARD_COLLECTION_NAME = 'cards';
const CARD_COLLECTION_SCHEMA = Joi.object({
  boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  columnId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),

  title: Joi.string().required().min(3).max(50).trim().strict(),
  description: Joi.string().optional(),
  memberIds: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)).default([]),

  // Dữ liệu comment của Card chúng ta sẽ học cách nhúng - embedded vào bản ghi Card luôn :
  comments: Joi.array()
    .items({
      userId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
      userEmail: Joi.string().pattern(EMAIL_RULE).message(EMAIL_RULE_MESSAGE),
      userAvatar: Joi.string(),
      content: Joi.string(),
      // Chỗ này lưu ý vì hàm $push để thêm comment nên không set default Date.now luôn giống hàm insertOne khi create được
      commentedAt: Joi.date().timestamp()
    })
    .default([]),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
});

const INVALID_UPDATE_FIELDS = ['_id', 'createdAt', 'boardId'];
const validateBeforeCreate = async (data) => {
  // abortEarly : true, trả về lỗi đầu tiên gặp,lần lượt các lỗi, abortEarly: false trả về hết tất cả các lỗi trong 1 lần
  return await CARD_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false });
};

const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data);

    const newValidData = {
      ...validData,
      boardId: new ObjectId(String(validData.boardId)),
      columnId: new ObjectId(String(validData.columnId))
    };

    return await GET_DB().collection(CARD_COLLECTION_NAME).insertOne(newValidData);
  } catch (e) {
    throw new Error(e);
  }
};

const findOneById = async (id) => {
  try {
    const result = await GET_DB()
      .collection(CARD_COLLECTION_NAME)
      .findOne({
        _id: new ObjectId(String(id))
      });
    return result;
  } catch (e) {
    throw new Error(e);
  }
};

const update = async (cardId, updateData) => {
  try {
    Object.keys(updateData).forEach((fieldName) => {
      if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
        delete updateData[fieldName];
      }
    });

    // Đối với những dữ liệu liên quan đến ObjectId, biến đổi ở đây:
    if (updateData.columnId) updateData.columnId = new ObjectId(String(updateData.columnId));

    const result = await GET_DB()
      .collection(CARD_COLLECTION_NAME)
      .findOneAndUpdate(
        {
          _id: new ObjectId(String(cardId))
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

const deleteAllCardByColumnId = async (columnId) => {
  try {
    const result = await GET_DB()
      .collection(CARD_COLLECTION_NAME)
      .deleteMany({
        columnId: new ObjectId(String(columnId))
      });
    return result;
  } catch (e) {
    throw new Error(e);
  }
};
// Dùng $each để đẩy 1 phần tử vào đầu của mảng
const unshiftNewComment = async (cardId, commentData) => {
  try {
    const result = await GET_DB()
      .collection(CARD_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(String(cardId)) },
        { $push: { comments: { $each: [commentData], $position: 0 } } },
        { returnDocument: 'after' }
      );
    return result;
  } catch (e) {
    throw new Error(e);
  }
};

const updateMembers = async (cardId, incomingMemberInfo) => {
  try {
    // Tạo ra một biến updateCondition ban đầu là rỗng
    let updateCondition = {};
    if (incomingMemberInfo.action === CARD_MEMBER_ACTIONS.ADD) {
      updateCondition = { $push: { memberIds: new ObjectId(String(incomingMemberInfo.userId)) } };
    }

    if (incomingMemberInfo.action === CARD_MEMBER_ACTIONS.REMOVE) {
      updateCondition = { $pull: { memberIds: new ObjectId(String(incomingMemberInfo.userId)) } };
    }

    const result = await GET_DB()
      .collection(CARD_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(String(cardId)) }, //
        updateCondition,
        { returnDocument: 'after' }
      );
    return result;
  } catch (e) {
    throw new Error(e);
  }
};
export const cardModel = {
  CARD_COLLECTION_NAME,
  CARD_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  update,
  deleteAllCardByColumnId,
  unshiftNewComment,
  updateMembers
};
