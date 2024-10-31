// example routes
import express from 'express';
import { StatusCodes } from 'http-status-codes';
const Router = express.Router();

Router.route('/')
  .get((req, res) => {
    res.status(StatusCodes.OK).json({ message: 'APIs get list borads' });
  })
  .post((req, res) => {
    res.status(StatusCodes.CREATED).json({ message: 'llo' });
  });
export const boardRoutes = Router;
