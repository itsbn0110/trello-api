/* eslint-disable no-console */
import express from 'express';
import cors from 'cors';
import exitHook from 'async-exit-hook';
import { corsOptions } from './config/cors';
import { CONNECT_DB, CLOSE_DB } from '~/config/mongodb';
import { env } from '~/config/environment';
import { APIs_V1 } from '~/routes/v1/index';
import { errorHandlingMiddleware } from '~/middlewares/errorHandlingMiddleware';
const START_SERVER = () => {
  const app = express();

  app.use(cors(corsOptions));

  app.use(express.json());

  app.use('/v1', APIs_V1);
  // Enable req.body json data

  // Middleware xử lí lỗi tập trung
  app.use(errorHandlingMiddleware);

  // Môi trường Production (support Render)
  if (env.BUILD_MODE === 'production') {
    app.listen(process.env.PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`3. Production: Trello Server hello ${env.AUTHOR} is running at ${process.env.PORT}`);
    });
  } else {
    // Môi trường Local Dev
    app.listen(env.LOCAL_DEV_APP_PORT, env.LOCAL_DEV_APP_HOST, () => {
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
