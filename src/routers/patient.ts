import express from 'express';
import { Patient } from '../models/patient.js';
import { Record } from '../models/record.js';
import { PatientFilter } from '../types/PatientFilter.js';
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
    let filter: PatientFilter = {};

    if (req.query.name) filter.name = req.query.name as string;
    if (req.query.identificationNumber) filter.identificationNumber = req.query.identificationNumber as string;

    try{
      const patient = await Patient.find(filter);

      if (patient.length === 0) {
       return res.status(404).send({ error: 'Paciente no encontrado' });
      } else {
        return res.status(200).send(patient);
      }
    } catch (error) {
      return res.status(500).send({ error: 'Error al obtener el paciente' });
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
   if (!req.body) {
      return res.status(400).send({error: 'Datos de actualización son requeridos'});
    } else {
      const allowedUpdates = ["contactInformation", "knownAllergies", "status"];
      const actualUpdates = Object.keys(req.body);
      const isValidUpdate = actualUpdates.every((update) => {
      return allowedUpdates.includes(update)
      })
   if (!isValidUpdate) {
     return res.status(400).send({ error: 'Actualización no válida' });
   } else {
     let filter: PatientFilter = {};

      if (req.query.name) filter.name = req.query.name as string;
      if (req.query.identificationNumber) filter.identificationNumber = req.query.identificationNumber as string;

      try {
        const patient = await Patient.findOneAndUpdate(
          filter,
          req.body,
          { new: true, runValidators: true },
        );
        if(patient) {
          return res.send(patient);
        } else {
          return res.status(404).send({ error: 'Paciente no encontrado' });
        }
      } catch (error) {
          return res.status(500).send({ error: 'Error al actualizar el paciente' });
      }
    }
  }
 })

patientRouter.patch('/patients/:id', async (req, res) => {
  if (!req.params.id) {
    res.status(400).send({ error: 'ID del paciente es requerido' });
  } else if (!req.body) {
    res.status(400).send({ error: 'Datos de actualización son requeridos' });
  } else {
      const allowedUpdates = ["contactInformation", "knownAllergies", "status"];
      const actualUpdates = Object.keys(req.body);
      const isValidUpdate = actualUpdates.every((update) =>  {
        return allowedUpdates.includes(update)
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

  patientRouter.delete('/patients/', async (req, res) => {
    if (!req.query.identificationNumber) {
      return res.status(400).send({ error: 'Número de identificación del paciente es requerido' });
    }

    try{
      const patient = await Patient.findOne({identificationNumber: req.query.identificationNumber as string});
      if (!patient) {
        return res.status(404).send({ error: 'Paciente no encontrado'});
      }
      await Record.deleteMany({ pacientId: patient._id });
      await Patient.findByIdAndDelete(patient._id);
      return res.status(200).send(patient);
    } catch (error) {
      return res.status(500).send({ error: 'Error al eliminar el paciente' }); 
    } 
  });

  patientRouter.delete('/patients/:id', async (req, res) => {
    try {
      await Record.deleteMany({ pacientId: req.params.id });
      const patient = await Patient.findByIdAndDelete(req.params.id);
      if (!patient) {
        return res.status(404).send({ error: 'Paciente no encontrado' });
      }
      return res.status(200).send(patient);
    } catch (error) {
      return res.status(500).send({ error: 'Error al eliminar el paciente' });
    }
  })



