// mongoDB config by DevB
import { env } from '~/config/environment';

import { MongoClient, ServerApiVersion } from 'mongodb';

// Khởi tạo 1 đối tượng trelloDatabaseInstance ban đầu là null vì chúng ta chưa connect
let trelloDatabaseInstance = null;

// Khởi tạo 1 đối tượng mongoCLientInstance để connect tới MongoDB
const mongoClientInstance = new MongoClient(env.MONGODB_URI, {
  // Lưu ý: Cái ServerApi có từ phiên bản MongoDB 5.0.0 trở lên, có thể không dùng nó,
  // còn nếu dùng nó là chúng ta sẽ chỉ định một cái Stable  API Version của MongoDB
  // Đọc thêm tại :https://www.mongodb.com/docs/drivers/node/current/fundamentals/stable-api/
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
});

// Kết nối tới database
export const CONNECT_DB = async () => {
  // Gọi kết nối tới MongoDB Atlas với URI đã khai báo trong thân của mongoClientInstance
  await mongoClientInstance.connect();

  // Kết nối thành công thì lấy ra Database theo tên và gán ngược lại nó vào biến trelloDatabaseInstance ở trên của chúng ta
  trelloDatabaseInstance = mongoClientInstance.db(env.DATABASE_NAME);
};

export const GET_DB = () => {
  // Function GET_DB (không async) này có nhiệm vụ export ra cái Trello Database Instance sau khi
  //  connect thành công tới MONGODB để chúng ta sử dụng lại ở nhiều nơi khác nhau trong code.
  // Lưu ý phải đảm bảo chỉ luôn gọi getDB này sau khi đã kết nối thành công tới MonggoDB
  if (!trelloDatabaseInstance) throw new Error('Must connect to Database first!');
  return trelloDatabaseInstance;
};

export const CLOSE_DB = async () => {
  await mongoClientInstance.close();
};
