import * as express from 'express';
import {Note} from '../models/note';

export const getRouter = express.Router();

getRouter.get('/notes', async (req, res) => {
  const filter = req.query.title?{title: req.query.title.toString()}:{};

  try {
    const notes = await Note.find(filter);

    if (notes.length !== 0) {
      return res.send(notes);
    }

    return res.status(404).send();
  } catch (error) {
    return res.status(500).send();
  }
});

getRouter.get('/notes/:id', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).send();
    }

    return res.send(note);
  } catch (error) {
    return res.status(500).send();
  }
});
