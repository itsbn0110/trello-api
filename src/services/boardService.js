/* eslint-disable no-useless-catch */
import { StatusCodes } from 'http-status-codes';
import { boardModel } from '~/models/boardModel';
import ApiError from '~/utils/ApiError';
import { slugify } from '~/utils/formatters';
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
    return board;
  } catch (e) {
    throw e;
  }
};
export const boardService = {
  createNew,
  getDetails
};
