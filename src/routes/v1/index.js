// routes v1
import express from 'express';
import { StatusCodes } from 'http-status-codes';
import { boardRoute } from './boardRoute';
import { columnRoute } from './columnRoute';
import { cardRoute } from './cardRoute';
import { userRoute } from './userRoute';

const Router = express.Router();

Router.get('/status', (req, res) => {
  res.status(StatusCodes.OK).json({ message: 'APIs V1 are ready to use' });
});

// Board API
Router.use('/boards', boardRoute);

// Column API
Router.use('/columns', columnRoute);

// Card API
Router.use('/cards', cardRoute);
// User API
Router.use('/users', userRoute);

export const APIs_V1 = Router;
