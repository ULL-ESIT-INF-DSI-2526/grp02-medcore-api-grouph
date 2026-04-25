import * as express from 'express';
import {Note} from '../models/note';

export const patchRouter = express.Router();

patchRouter.patch('/notes', async (req, res) => {
  if (!req.query.title) {
    return res.status(400).send({
      error: 'A title must be provided',
    });
  }

  const allowedUpdates = ['title', 'body', 'color'];
  const actualUpdates = Object.keys(req.body);
  const isValidUpdate =
    actualUpdates.every((update) => allowedUpdates.includes(update));

  if (!isValidUpdate) {
    return res.status(400).send({
      error: 'Update is not permitted',
    });
  }

  try {
    const note =
    await Note.findOneAndUpdate({title: req.query.title.toString()}, req.body, {
      new: true,
      runValidators: true,
    });

    if (!note) {
      return res.status(404).send();
    }

    return res.send(note);
  } catch (error) {
    return res.status(400).send(error);
  }
});

patchRouter.patch('/notes/:id', async (req, res) => {
  const allowedUpdates = ['title', 'body', 'color'];
  const actualUpdates = Object.keys(req.body);
  const isValidUpdate =
      actualUpdates.every((update) => allowedUpdates.includes(update));

  if (!isValidUpdate) {
    return res.status(400).send({
      error: 'Update is not permitted',
    });
  }

  try {
    const note = await Note.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!note) {
      return res.status(404).send();
    }

    return res.send(note);
  } catch (error) {
    return res.status(400).send(error);
  }
});
