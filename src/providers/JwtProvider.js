// https://www.npmjs.com/package/jsonwebtoken
import JWT from 'jsonwebtoken';

/**
 * Function tạo mới một token - Cần 3 tham số đầu vào
 * userInfo: Những thông tin muốn đính kèm vào token
 * secretSignature: Chữ kí bí mật (dạng một chuỗi) string ngẫu nhiên trên docs thì để tên là privateKey đều được
 * tokenLife: Thời gian sống của Token
 */

const generateToken = async (userInfo, secretSignature, tokenLife) => {
  try {
    return JWT.sign(userInfo, secretSignature, { algorithm: 'HS256', expiresIn: tokenLife });
  } catch (e) {
    throw new Error(e);
  }
};

/**
 * Function kiểm tra một token có hợp lệ hay không
 * Hợp lệ ở đây hiểu đơn giản là cái token được tạo ra có đúng với cái chữ kí bí mật secretSignature trong dự án hay không
 */
const verifyToken = async (token, secretSignature) => {
  try {
    return JWT.verify(token, secretSignature);
  } catch (e) {
    throw new Error(e);
  }
};

export const JwtProvider = {
  generateToken,
  verifyToken
};
