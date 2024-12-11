import { cardModel } from '~/models/cardModel';
import { columnModel } from '~/models/columnModel';
import { CloudinaryProvider } from '~/providers/CloudinaryProvider';
const createNew = async (data) => {
  try {
    const newCard = {
      ...data
    };

    const result = await cardModel.createNew(newCard);
    const getNewCard = await cardModel.findOneById(result.insertedId.toString());

    if (getNewCard) {
      // Cập nhật lại mảng cardOrderIds trong collection columns
      await columnModel.pushCardOrderIds(getNewCard);
    }

    return getNewCard;
  } catch (e) {
    throw e;
  }
};

const update = async (cardId, reqBody, cardCoverFile, userInfo) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    };

    let updatedCard = {};

    if (cardCoverFile) {
      // Trường hợp upload file lên Cloud Storage, cụ thể là Cloudinary
      const uploadResult = await CloudinaryProvider.streamUpload(cardCoverFile.buffer, 'card-covers');
      // console.log('uploadResult', uploadResult);
      // Lưu lại url (secure_url) của cái file ảnh vào trong database
      updatedCard = await cardModel.update(cardId, {
        cover: uploadResult.secure_url
      });
    } else if (updateData.commentToAdd) {
      // Tạo dữ liệu comment để thêm vào database, bổ sung những field cần thiết
      const commentData = {
        ...updateData.commentToAdd,
        commentedAt: Date.now(),
        userId: userInfo._id,
        userEmail: userInfo.email
      };

      updatedCard = await cardModel.unshiftNewComment(cardId, commentData);
    } else if (updateData.incomingMemberInfo) {
      // Trường hợp ADD hoặc REMOVE thành viên ra khỏi Card
      updatedCard = await cardModel.updateMembers(cardId, updateData.incomingMemberInfo);
    } else {
      // Các trường hợp update chung như title, description
      updatedCard = await cardModel.update(cardId, updateData, cardCoverFile);
    }

    return updatedCard;
  } catch (e) {
    throw e;
  }
};

export const cardService = {
  createNew,
  update
};
