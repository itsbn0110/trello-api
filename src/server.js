/* eslint-disable no-console */
import express from 'express';
import cors from 'cors';
import exitHook from 'async-exit-hook';
import { corsOptions } from './config/cors';
import { CONNECT_DB, CLOSE_DB } from '~/config/mongodb';
import { env } from '~/config/environment';
import { APIs_V1 } from '~/routes/v1/index';
import { errorHandlingMiddleware } from '~/middlewares/errorHandlingMiddleware';
import cookieParser from 'cookie-parser';
// Xử lý socket real-time với gói socket.io
// https://socket.io/get-started/chat/#integrating-socketio
import http from 'http';
import socketIo from 'socket.io';
import { inviteUserToBoardSocket } from './sockets/inviteUserToBoardSocket';
const START_SERVER = () => {
  const app = express();
  // không dùng cache phía trình duyệt (tạm thời )
  // https://stackoverflow.com/a/53240717/8324172
  app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
  });
  // Cấu hình cookieParser
  app.use(cookieParser());

  app.use(cors(corsOptions));
  // Cấu hình gửi data theo dạng json-object http qua server

  app.use(express.json());

  app.use('/v1', APIs_V1);
  // Enable req.body json data

  // Middleware xử lí lỗi tập trung
  app.use(errorHandlingMiddleware);

  // Tạo một cái server mới bọc thằng app của express để làm real-time với socket.io
  const server = http.createServer(app);
  // Khởi tạo biến io với server và cors
  const io = socketIo(server, { cors: corsOptions });

  io.on('connection', (socket) => {
    // Gọi các socket tùy theo tính năng
    inviteUserToBoardSocket(socket);
  });
  // Môi trường Production (support Render)
  if (env.BUILD_MODE === 'production') {
    // dùng server.listen thay vì app.listen vì server đã bao gồm express app và đã config socket.io
    server.listen(process.env.PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`3. Production: Trello Server hello ${env.AUTHOR} is running at ${process.env.PORT}`);
    });
  } else {
    // Môi trường Local Dev
    // dùng server.listen thay vì app.listen vì server đã bao gồm express app và đã config socket.io
    server.listen(env.LOCAL_DEV_APP_PORT, env.LOCAL_DEV_APP_HOST, () => {
      // eslint-disable-next-line no-console
      console.log(
        `3.Local Dev: Trello Server hello ${env.AUTHOR} is running at http://${env.LOCAL_DEV_APP_HOST}:${env.LOCAL_DEV_APP_PORT}/`
      );
    });
  }

  // clean up trc khi dừng server
  exitHook(() => {
    CLOSE_DB();
  });
};

// Chỉ khi kết nối DB thành công mới gọi START_SERVER()

(async () => {
  try {
    console.log('1. Connecting to MongoDB Cloud Atlas....');
    await CONNECT_DB();
    console.log('2. Connected to MongoDB Cloud Atlas....');

    START_SERVER();
  } catch (error) {
    console.error(error);
    // Dừng server
    process.exit(0);
  }
})();
// Chỉ khi kết nối DB thành công mới gọi START_SERVER()
// CONNECT_DB()
//   .then(() => console.log('Connected to MongoDB Atlas'))
//   .then(() => START_SERVER())
//   .catch((error) => {
//     console.error(error);
//     // Dừng server
//     process.exit(0);
//   });
