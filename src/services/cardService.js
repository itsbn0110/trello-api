import { cardModel } from '~/models/cardModel';
import { columnModel } from '~/models/columnModel';

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

export const cardService = {
  createNew
};
