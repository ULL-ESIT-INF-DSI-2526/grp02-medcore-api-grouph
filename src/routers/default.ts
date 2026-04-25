import express from 'express';

export const defaultRouter = express.Router();

defaultRouter.use((_, res) => {
  res.status(501).send();
});
