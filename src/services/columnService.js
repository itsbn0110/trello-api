import { columnModel } from '~/models/columnModel';
import { boardModel } from '~/models/boardModel';
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

export const columnService = {
  createNew,
  update
};
