// example controller
import { StatusCodes } from 'http-status-codes';
import { boardService } from '~/services/boardService';
const createNew = async (req, res, next) => {
  try {
    // console.log('req.body', req.body);
    const userId = req.jwtDecoded._id;

    const createdBoard = await boardService.createNew(userId, req.body);
    res.status(StatusCodes.CREATED).json(createdBoard);
  } catch (e) {
    next(e);
  }
};

const getDetails = async (req, res, next) => {
  try {
    // console.log('req.params', req.params);
    const userId = req.jwtDecoded._id;
    const boardId = req.params.id;
    const board = await boardService.getDetails(userId, boardId);
    res.status(StatusCodes.OK).json(board);
  } catch (e) {
    next(e);
  }
};

const update = async (req, res, next) => {
  try {
    const boardId = req.params.id;
    const updatedBoard = await boardService.update(boardId, req.body);
    res.status(StatusCodes.OK).json(updatedBoard);
  } catch (e) {
    next(e);
  }
};

const moveCardToDifferentColumn = async (req, res, next) => {
  try {
    const result = await boardService.moveCardToDifferentColumn(req.body);
    res.status(StatusCodes.OK).json(result);
  } catch (e) {
    next(e);
  }
};

const getBoards = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id;
    // Page và itemsPerPage được truyền vào trong query url từ phía FE nên BE sẽ lấy thông qua req.query
    const { page, itemsPerPage, q } = req.query;
    const queryFilters = q;
    const results = await boardService.getBoards(userId, page, itemsPerPage, queryFilters);

    res.status(StatusCodes.OK).json(results);
  } catch (e) {
    next(e);
  }
};
export const boardController = {
  createNew,
  getDetails,
  update,
  moveCardToDifferentColumn,
  getBoards
};
