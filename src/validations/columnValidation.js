// example
import Joi from 'joi';
import { StatusCodes } from 'http-status-codes';
import ApiError from '~/utils/ApiError';
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators';

const createNew = async (req, res, next) => {
  const correctCondition = Joi.object({
    boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
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

const update = async (req, res, next) => {
  // Có thể custom messages của JOI để ghì đè lại và trả về message theo ý muốn
  // VD: title: Joi.string().required().min(3).max(50).trim().strict().messages({'any.required': 'title is required hehehe'})
  // Không dùng required () trong trường hợp Update
  const correctCondition = Joi.object({
    // Nếu cần làm tính năng di chuyển sang Board khác thì mới cần validate boardId
    // boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    title: Joi.string().min(3).max(50).trim().strict(),
    cardOrderIds: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE))
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

const deleteItem = async (req, res, next) => {
  // Có thể custom messages của JOI để ghì đè lại và trả về message theo ý muốn
  // VD: title: Joi.string().required().min(3).max(50).trim().strict().messages({'any.required': 'title is required hehehe'})
  // Không dùng required () trong trường hợp Update
  const correctCondition = Joi.object({
    id: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  });
  try {
    await correctCondition.validateAsync(req.params);
    next();
  } catch (e) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(e).message));
  }
};
export const columnValidation = {
  createNew,
  update,
  deleteItem
};
