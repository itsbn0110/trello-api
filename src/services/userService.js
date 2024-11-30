import { StatusCodes } from 'http-status-codes';
import { userModel } from '~/models/userModel';
import { pickUser } from '~/utils/formatters';
import ApiError from '~/utils/ApiError';
import bcryptjs from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { WEBSITE_DOMAIN } from '~/utils/constants';
import { BrevoProvider } from '~/providers/BrevoProvider';
const createNew = async (reqBody) => {
  try {
    // Kiểm tra xem email đã tồn tại trong hệ thống của chúng ta hay chưa
    const existUser = await userModel.findOneByEmail(reqBody.email);
    if (existUser) {
      throw new ApiError(StatusCodes.CONFLICT, 'Email already exists! ');
    }

    // Tạo data để lưu vào database
    // nameFromEmail nếu email là baongo610@gmail.com thì sẽ lấy được "baongo610 "
    const nameFromEmail = reqBody.email.split('@')[0];
    const newUser = {
      email: reqBody.email,
      password: bcryptjs.hashSync(reqBody.password, 8), // Tham số thứ hai là độ phức tạp, giá trị càng cao thì băm mật khẩu càng lâu
      username: nameFromEmail,
      displayName: nameFromEmail, // mặc định để giống username khi user đăng kí mới, về sau làm tính năng update cho user
      verifyToken: uuidv4()
    };
    // Thực hiện lưu thông tin User vào database
    const createdUser = await userModel.createNew(newUser);
    const getNewUser = await userModel.findOneById(createdUser.insertedId.toString());
    // Gửi email cho người dùng xác thực tài khoản
    const verificationLink = `${WEBSITE_DOMAIN}/account/verification?email=${getNewUser.email}&token=${getNewUser.verifyToken}`;
    const customSubject = 'Please verify your email before using our services!';
    const htmlContent = `
      <h3> Here is your verifycation link: </h3>
      <h3> ${verificationLink} </h3>
      <h3> Sincerely, <br/> -Bao Ngo </h3>
    `;

    // Gọi tới cái Provider gửi mail
    await BrevoProvider.sendEmail(getNewUser.email, customSubject, htmlContent);

    // Return trả về dữ liệu cho phía controller
    return pickUser(getNewUser);
  } catch (e) {
    throw e;
  }
};

export const userService = {
  createNew
};
