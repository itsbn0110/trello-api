// example
import Joi from 'joi';
import { StatusCodes } from 'http-status-codes';

const createNew = async (req, res, next) => {
  // Có thể custom messages của JOI để ghì đè lại và trả về message theo ý muốn
  // VD: title: Joi.string().required().min(3).max(50).trim().strict().messages({'any.required': 'title is required hehehe'})
  const correctCondition = Joi.object({
    title: Joi.string().required().min(3).max(50).trim().strict(),
    description: Joi.string().required().min(3).max(256).trim().strict()
  });
  try {
    // console.log('req.body', req.body);
    // abortearly trả về tất cả lỗi validation
    await correctCondition.validateAsync(req.body, { abortEarly: false });
    // next()
    res.status(StatusCodes.CREATED).json({ message: 'Created New' });
  } catch (e) {
    console.log(e);
    res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
      errors: new Error(e).message
    });
  }
};

export const boardValidation = {
  createNew
};
