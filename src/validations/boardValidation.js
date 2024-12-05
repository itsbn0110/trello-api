// example
import Joi from 'joi';
import { StatusCodes } from 'http-status-codes';
import ApiError from '~/utils/ApiError';
import { BOARD_TYPES } from '~/utils/constants';
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators';
import { boardService } from '~/services/boardService';

const createNew = async (req, res, next) => {
  // Có thể custom messages của JOI để ghì đè lại và trả về message theo ý muốn
  // VD: title: Joi.string().required().min(3).max(50).trim().strict().messages({'any.required': 'title is required hehehe'})
  const correctCondition = Joi.object({
    title: Joi.string().required().min(3).max(50).trim().strict(),
    description: Joi.string().required().min(3).max(256).trim().strict(),
    type: Joi.string().valid(BOARD_TYPES.PUBLIC, BOARD_TYPES.PRIVATE).required()
  });
  try {
    // abortearly trả về tất cả lỗi validation
    await correctCondition.validateAsync(req.body, { abortEarly: false });
    // Validate dữ liệu xong xuôi hợp lệ thì cho request đi tiếp sang controller
    next();
  } catch (e) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(e).message));
  }
};

const update = async (req, res, next) => {
  // Có thể custom messages của JOI để ghì đè lại và trả về message theo ý muốn
  // VD: title: Joi.string().required().min(3).max(50).trim().strict().messages({'any.required': 'title is required hehehe'})
  // Không dùng required () trong trường hợp Update
  const correctCondition = Joi.object({
    title: Joi.string().min(3).max(50).strict(),
    description: Joi.string().min(3).max(256).strict(),
    type: Joi.string().valid(BOARD_TYPES.PUBLIC, BOARD_TYPES.PRIVATE)
  });
  try {
    // abortearly trả về tất cả lỗi validation
    // Đối với trường hợp update, cho phép Unknown để không caanf đẩy một số field lên
    await correctCondition.validateAsync(req.body, { abortEarly: false, allowUnknown: true });
    // Validate dữ liệu xong xuôi hợp lệ thì cho request đi tiếp sang controller
    next();
  } catch (e) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(e).message));
  }
};

const moveCardToDifferentColumn = async (req, res, next) => {
  const correctCondition = Joi.object({
    currentCardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    prevColumnId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    prevCardOrderIds: Joi.array()
      .required()
      .items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)),
    nextColumnId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    nextCardOrderIds: Joi.array().required().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE))
  });
  try {
    // abortearly trả về tất cả lỗi validation
    // Đối với trường hợp update, cho phép Unknown để không caanf đẩy một số field lên
    await correctCondition.validateAsync(req.body, { abortEarly: false });
    // Validate dữ liệu xong xuôi hợp lệ thì cho request đi tiếp sang controller
    next();
  } catch (e) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(e).message));
  }
};

export const boardValidation = {
  createNew,
  update,
  moveCardToDifferentColumn
};
