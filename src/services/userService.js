import { StatusCodes } from 'http-status-codes';
import { userModel } from '~/models/userModel';
import { pickUser } from '~/utils/formatters';
import ApiError from '~/utils/ApiError';
import bcryptjs from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { WEBSITE_DOMAIN } from '~/utils/constants';
import { BrevoProvider } from '~/providers/BrevoProvider';
import { env } from '~/config/environment';
import { JwtProvider } from '~/providers/JwtProvider';
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

const verifyAccount = async (reqBody) => {
  try {
    // Query User trong Database
    const existUser = await userModel.findOneByEmail(reqBody.email);

    // Các bước kiểm tra cần thiết
    if (!existUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!');
    if (existUser.isActive) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your account is already exist!');
    }
    if (reqBody.token !== existUser.verifyToken) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Invalid Token!');
    }

    // Nếu như mọi thứ ok ta bắt đầu update thông tin của thằng user để verify account
    const updateData = {
      isActive: true,
      verifyToken: null
    };
    //  Thực hiện update thông tin user
    const updatedUser = await userModel.update(existUser._id, updateData);

    return pickUser(updatedUser);
  } catch (error) {
    throw error;
  }
};

const login = async (reqBody) => {
  try {
    // Query User trong Database
    const existUser = await userModel.findOneByEmail(reqBody.email);

    // Các bước kiểm tra cần thiết
    if (!existUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!');
    if (!existUser.isActive) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your account is not active!');
    }
    if (!bcryptjs.compareSync(reqBody.password, existUser.password)) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your Email or Password is incorrect!');
    }

    // Nếu mọi thứ ok thì bắt đầu tạo Tokens đăng nhập để trả về cho phía FE
    // Tạo thông tin để đính kèm trong JWT Token bao gồm _id và email của user
    const userInfo = {
      _id: existUser._id,
      email: existUser.email
    };
    // Tạo ra 2 loại token, accessToken và refreshToken để trả về cho phía FE

    const accessToken = await JwtProvider.generateToken(
      userInfo,
      env.ACCESS_TOKEN_SECRET_SIGNATURE,
      // env.ACCESS_TOKEN_LIFE
      5
    );

    const refreshToken = await JwtProvider.generateToken(
      userInfo,
      env.REFRESH_TOKEN_SECRET_SIGNATURE,
      // env.REFRESH_TOKEN_LIFE
      15
    );

    // Trả về thông tin của user kèm theo 2 cái token vừa tạo ra
    return { accessToken, refreshToken, ...pickUser(existUser) };
  } catch (error) {
    throw error;
  }
};

const refreshToken = async (clientRefreshToken) => {
  try {
    // Verify / giải mã cái refresh token xem có hợp lệ không
    const refreshTokenDecoded = await JwtProvider.verifyToken(clientRefreshToken, env.REFRESH_TOKEN_SECRET_SIGNATURE);

    // Đoạn này vì chúng ta chỉ lưu những thông tin unique và cố định của user trong token rồi, vì vậy có thể
    // lấy luôn từ decoded ra, tiết kiệm query vào DB để lấy data mới
    const userInfo = {
      _id: refreshTokenDecoded._id,
      email: refreshTokenDecoded.email
    };
    // Tạo accessToken mới
    const accessToken = await JwtProvider.generateToken(
      userInfo, //
      env.ACCESS_TOKEN_SECRET_SIGNATURE,
      // env.ACCESS_TOKEN_LIFE // 1 tiếng
      5
    );

    return { accessToken };
  } catch (e) {
    throw e;
  }
};
export const userService = {
  createNew,
  verifyAccount,
  login,
  refreshToken
};
