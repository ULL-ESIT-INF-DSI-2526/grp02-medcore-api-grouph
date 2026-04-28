import express from 'express';
import { Patient } from '../models/patient.js';

export const patientRouter = express.Router();

patientRouter.post('/patients', async (req, res) => {
  const patient = new Patient(req.body);
  try {
    await patient.save();
    res.status(201).send(patient);
  } catch (error) {
    res.status(500).send(error);
  }
});

patientRouter.get('/patients', async (req, res) => {
  try {
    const match: any = {};
    if (req.query.name) {
      match.name = req.query.name;
    }
    if (req.query.identificationNumber) {
      match.identificationNumber = req.query.identificationNumber;
    }
    const patients = await Patient.find(match);

    if (patients.length === 0) {
      res.status(404).send({ error: 'No se encontraron pacientes con los criterios de búsqueda' });
    }
    res.send(patients);
  } catch (error) {
    res.status(500).send({ error: 'Error al obtener los pacientes' });
   }
});

patientRouter.get('/patients/:id', async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      res.status(404).send({ error: 'Paciente no encontrado'});
    } else {
      res.send(patient);
    }
  } catch (error) {
    res.status(500).send({ error: 'Error al obtener el paciente'})
  };
});

patientRouter.patch('/patients', async (req, res) => {
  
})

patientRouter.patch('/patients/:id', async (req, res) => {
  if (!req.params.id) {
    res.status(400).send({ error: 'ID del paciente es requerido' });
  } else if (!req.body) {
    res.status(400).send({ error: 'Datos de actualización son requeridos' });
  } else {
      const allowedUpdates = ['name', 'identificationNumber', 'age', 'gender', 'address', 'phone'];
      const actualUpdates = Object.keys(req.body);
      const isValidUpdate = actualUpdates.every((update) => { 
        allowedUpdates.includes(update)
      });

      if (!isValidUpdate) {
        res.status(400).send({ error: 'Actualización no válida' });
      } else {

        try {
          const patient = await Patient.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true },
          )

          if(patient) {
            res.send(patient);
          } else {
            res.status(404).send({ error: 'Paciente no encontrado' });
          }
        } catch (error) {
          res.status(500).send({ error: 'Error al actualizar el paciente' });
        }
      }
    }
  });



