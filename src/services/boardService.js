/* eslint-disable no-useless-catch */
import { StatusCodes } from 'http-status-codes';
import { boardModel } from '~/models/boardModel';
import ApiError from '~/utils/ApiError';
import { slugify } from '~/utils/formatters';
import { cloneDeep } from 'lodash';
import { columnModel } from '~/models/columnModel';
import { cardModel } from '~/models/cardModel';

// example Service
const createNew = async (data) => {
  try {
    const newBoard = {
      ...data,
      slug: slugify(data.title)
    };

    const result = await boardModel.createNew(newBoard);
    const newResult = await boardModel.findOneById(result.insertedId.toString());
    return newResult;
  } catch (e) {
    throw e;
  }
};

const getDetails = async (boardId) => {
  try {
    const board = await boardModel.getDetails(boardId);
    if (!board) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found!!');
    }

    // tao ra một cái board mới ko ảnh hưởng đến board ban đầu
    const resBoard = cloneDeep(board);
    resBoard.columns.forEach((column) => {
      // equals cua? mongodb
      column.cards = resBoard.cards.filter((card) => card.columnId.equals(column._id));
      // toString() cua? javascript
      // column.cards = resBoard.cards.filter((card) => card.columnId.toString() === column._id.toString());
    });
    delete resBoard.cards;
    return resBoard;
  } catch (e) {
    throw e;
  }
};

const update = async (boardId, reqBody) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    };

    const updatedBoard = await boardModel.update(boardId, updateData);

    return updatedBoard;
  } catch (e) {
    throw e;
  }
};

const moveCardToDifferentColumn = async (reqBody) => {
  try {
    // * Cập nhật mảng cardOrderIDs của Column ban đầu chứa nó, bản chất là xóa cái _id của Card ra khỏi mảng)
    // * Cập nhật mảng cardOrderIds của Column tiếp theo (Bản chất là thêm _id của Card vào mảng)
    // * Cập nhật lại trường columnId mới của cái Card đã kéo

    await columnModel.update(reqBody.prevColumnId, {
      cardOrderIds: reqBody.prevCardOrderIds,
      updatedAt: Date.now()
    });

    await columnModel.update(reqBody.nextColumnId, {
      cardOrderIds: reqBody.nextCardOrderIds,
      updatedAt: Date.now()
    });

    await cardModel.update(reqBody.currentCardId, {
      columnId: reqBody.nextColumnId
    });

    return { updatedResultL: 'Successfully!' };
  } catch (e) {
    throw e;
  }
};
export const boardService = {
  createNew,
  getDetails,
  update,
  moveCardToDifferentColumn
};
