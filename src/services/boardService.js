/* eslint-disable no-useless-catch */
import { boardModel } from '~/models/boardModel';
import { StatusCodes } from 'http-status-codes';
import ApiError from '~/utils/ApiError';
import { slugify } from '~/utils/formatters';
import { cloneDeep } from 'lodash';
import { columnModel } from '~/models/columnModel';
import { cardModel } from '~/models/cardModel';
import { DEFAULT_PAGE, DEFAULT_ITEMS_PER_PAGE } from '~/utils/constants';
// example Service
const createNew = async (data) => {
  try {
    const newBoard = {
      ...data,
      slug: slugify(data.title)
    };

    const createdBoard = await boardModel.createNew(newBoard);
    const getNewBoard = await boardModel.findOneById(createdBoard.insertedId.toString());
    return getNewBoard;
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
const getBoards = async (userId, page, itemsPerPage) => {
  try {
    // Nếu không tồn tại page hoặc itemsPerPage từ FE thì BE cần phải luôn gán default value
    if (!page) page = DEFAULT_PAGE;
    if (!itemsPerPage) itemsPerPage = DEFAULT_ITEMS_PER_PAGE;

    const results = await boardModel.getBoards(userId, parseInt(page, 10), parseInt(itemsPerPage, 10));
    return results;
  } catch (e) {
    throw e;
  }
};
export const boardService = {
  createNew,
  getDetails,
  update,
  moveCardToDifferentColumn,
  getBoards
};
