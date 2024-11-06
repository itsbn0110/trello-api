import { columnModel } from '~/models/columnModel';
import { boardModel } from '~/models/boardModel';
import { cardModel } from '~/models/cardModel';

import { StatusCodes } from 'http-status-codes';
import ApiError from '~/utils/ApiError';
const createNew = async (data) => {
  try {
    const newColumn = {
      ...data
    };

    const result = await columnModel.createNew(newColumn);
    const getNewColumn = await columnModel.findOneById(result.insertedId.toString());

    if (getNewColumn) {
      getNewColumn.cards = [];
      // Cập nhật lại mảng columnOrderIds trong collection boards
      await boardModel.pushColumnOrderIds(getNewColumn);
    }

    return getNewColumn;
  } catch (e) {
    throw e;
  }
};

const update = async (columnId, reqBody) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    };

    const updatedColumn = await columnModel.update(columnId, updateData);

    return updatedColumn;
  } catch (e) {
    throw e;
  }
};

const deleteItem = async (columnId) => {
  try {
    const targetColumn = await columnModel.findOneById(columnId);

    if (!targetColumn) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Column not found!!');
    }
    // Xoá column
    await columnModel.deleteOneById(columnId);
    // Xóa toàn bộ cards thuộc cái Column trên
    await cardModel.deleteAllCardByColumnId(columnId);
    // Xóa columnId trong mảng columnOrderIds của Board chứa nó
    await boardModel.pullColumnOrderIds(targetColumn);
    return { deleteResult: 'Column and its Cards deleted successfully!' };
  } catch (e) {
    throw e;
  }
};

export const columnService = {
  createNew,
  update,
  deleteItem
};
