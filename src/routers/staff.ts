import express from 'express';
import { Staff } from '../models/staff.js';

export const staffRouter = express.Router();

staffRouter.post('/staff', async (req, res) => {
  const staff = new Staff(req.body);
  try {
    await staff.save();
    res.status(201).send(staff);
  } catch (error) {
    res.status(500).send(error);
  }
});

staffRouter.get('/staff/:id', async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      res.status(404).send({ error: 'Paciente no encontrado'});
    } else {
      res.send(staff);
    }
  } catch (error) {
    res.status(500).send({ error: 'Error al obtener el paciente'})
  }
});