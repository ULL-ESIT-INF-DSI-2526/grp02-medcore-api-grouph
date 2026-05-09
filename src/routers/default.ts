import express from 'express';

export const defaultRouter = express.Router();

defaultRouter.use((_, res) => {
  res.status(501).send({
    help: 'Check our documentation for available endpoints',
    link: 'https://medcore-api-grouph.onrender.com/api-docs'
   });
});