/* eslint-disable no-useless-catch */
import { slugify } from '~/utils/formatters';
// example Service
const createNew = async (data) => {
  try {
    const newBoard = {
      ...data,
      slug: slugify(data.title)
    };
    return newBoard;
  } catch (e) {
    throw e;
  }
};

export const boardService = {
  createNew
};
