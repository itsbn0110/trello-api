// example
import Joi from 'joi';
import { StatusCodes } from 'http-status-codes';
import ApiError from '~/utils/ApiError';
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators';

const createNew = async (req, res, next) => {
  const correctCondition = Joi.object({
    boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    columnId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    title: Joi.string().required().min(3).max(50).trim().strict()
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

export const cardValidation = {
  createNew
};
