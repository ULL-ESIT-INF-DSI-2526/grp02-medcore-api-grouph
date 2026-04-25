import * as express from 'express';
import {Note} from '../models/note';

export const deleteRouter = express.Router();

deleteRouter.delete('/notes', async (req, res) => {
  if (!req.query.title) {
    return res.status(400).send({
      error: 'A title must be provided',
    });
  }

  try {
    const note =
      await Note.findOneAndDelete({title: req.query.title.toString()});

    if (!note) {
      return res.status(404).send();
    }

    return res.send(note);
  } catch (error) {
    return res.status(400).send();
  }
});

deleteRouter.delete('/notes/:id', async (req, res) => {
  try {
    const note = await Note.findByIdAndDelete(req.params.id);

    if (!note) {
      return res.status(404).send();
    }

    return res.send(note);
  } catch (error) {
    return res.status(400).send();
  }
});
