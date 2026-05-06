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
    let filter: PatientFilter;

    if (req.query.name) {
      filter = { name: req.query.name as string };
    } else if (req.query.identificationNumber) {
      filter = { identificationNumber: req.query.identificationNumber as string };
    } else {
      return res.status(400).send({ error: 'Se requiere un filtro de búsqueda (name o identificationNumber)' });
    }

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
        allowedUpdates.includes(update)
      })
   if (!isValidUpdate) {
     return res.status(400).send({ error: 'Actualización no válida' });
   } else {
     let filter: PatientFilter;

      if (req.query.name) {
        filter = { name: req.query.name as string };
      } else if (req.query.identificationNumber) {
        filter = { identificationNumber: req.query.identificationNumber as string };
      } else {
        return res.status(400).send({ error: 'Se requiere un filtro de búsqueda (name o identificationNumber)' });
      }

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

  patientRouter.delete('/patients/', async (req, res) => {
    let filter: PatientFilter;

    if(req.query.name) {
      filter = { name: req.query.name as string };
    } else if (req.query.identificationNumber) {
      filter = { identificationNumber: req.query.identificationNumber as string };
    } else {
      return res.status(400).send({ error: 'Se requiere un filtro de búsqueda (name o identificationNumber)' });
    }
    try {
      const patient = await Patient.findOne(filter);
      if (!patient) {
        return res.status(404).send({ error: 'Paciente no encontrado' });
      }
      const hasRecords = await Record.find({ patient: patient._id });
      if (hasRecords.length > 0) {
        Record.deleteMany({ patient: patient._id });
      }
      await Patient.deleteOne({ _id: patient._id });
      return res.status(200).send(patient);
    } catch (error) {
      return res.status(500).send({ error: 'Error al eliminar el paciente' });
    }
  });

  patientRouter.delete('/patients/:id', async (req, res) => {
    if (!req.params.id) {
      return res.status(400).send({ error: 'ID del paciente es requerido' });
    } else{
      try {
        const patient = await Record.find({ patient: req.params.id})
        if (patient.length > 0) {
          Record.deleteMany({ patient: req.params.id });
        }
        const deletedPatient = await Patient.findByIdAndDelete(req.params.id);
        if (deletedPatient) {
          return res.status(200).send(deletedPatient);
        } else {
          return res.status(404).send({ error: 'Paciente no encontrado' });
        }
      } catch (error) {
        return res.status(500).send({ error: 'Error al eliminar el paciente' });
      } 
    }
  })



