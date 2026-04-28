import express from 'express';
import { Staff } from '../models/staff.js';
import { ContactInfo } from '../interfaces/ContactInfo.js';

export const staffRouter = express.Router();
type StaffSearch = {name?: string, specialty?: string}
type StaffUpdate = {specialty?: 'Medicina General' | 'Cardiología' | 'Traumatología' | 'Pediatría' | 'Oncología' | 'Urgencias',
                    professionalCategory?: 'Medic' | 'Resident' | 'Nurse' | 'Nurse Auxiliar' | 'Head of Service',
                    shift?: 'Mañana' | 'Tarde' | 'Noche' | 'Rotatorio',
                    consultNumber?: number,
                    yearsExperience?: number,
                    contactInfo?: ContactInfo,
                    status?: 'Activo' | 'Inactivo',}

function StaffGetFilter(req :express.Request) :Promise<StaffSearch> {
  return new Promise<StaffSearch>((resolve) => {
    let filter :StaffSearch = {}
    if (req.query.name) filter = {name: req.query.name.toString()}
    if (req.query.specialty) filter = {specialty: req.query.specialty.toString()}
    resolve(filter)
  }) 
}

function StaffAllowUpdate(req :express.Request) :Promise<boolean> {
  return new Promise<boolean>((resolve, rejected) => {
    const allowedUpdates = ['specialty', 'professionalCategory', 'shift', 'consultNumber', 'yearsExperience', 'contactInfo', 'state']
    const actualUpdate = Object.keys(req.body)
    const isValidUpdate = actualUpdate.every((update) => allowedUpdates.includes(update)) 
    if (!isValidUpdate) rejected({ status: 412, error: 'Los campos de la consulta no se pueden modificar'})
    else resolve(true)
  })
}

function StaffAllowSearch(req :express.Request) :Promise<boolean> {
  return new Promise<boolean>((resolve, rejected) => {
    const allowedQueries = ['name', 'specialty']
    for (const query in req.query) {
      if (!allowedQueries.includes(query)) 
        rejected({status: 400, error: `Query ${query} no permitido`})
    }
    resolve(true)
  }) 
}

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
      res.status(404).send({ error: 'Miembro del staff no encontrado'});
    } else {
      res.send(staff);
    }
  } catch (error) {
    res.status(500).send({ error: 'Error al obtener el miembro del staff'})
  }
});

staffRouter.get('/staff/', async (req, res) => {
  let filter :StaffSearch = {}
  StaffAllowSearch(req)
  .then(() => {
    return StaffGetFilter(req) 
  })
  .then((filter) => {
    return Staff.find(filter)
  })
  .then((response) => {
    if (response.length)
      res.status(200).send(response)
    else 
      res.status(404).send({error: 'Miembro del staff no encontrado'})
  })
  .catch((err) => {
    res.status(err.status ?? 500).send(err.error)
  }) 
})

staffRouter.patch('/staff/:id', async (req, res) => {
  if (!req.body) res.status(400).send({error: 'Se deben aportar en la consulta los campos a modificar'})
  else {
    StaffAllowUpdate(req)
    .then(() => {
      return Staff.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
      })
    })
    .then((response) => {
      if (!response) res.status(404).send({error: 'No se encontro el staff que se quiere actualizar'})
      else res.status(200).send(response)
    })
    .catch((err) => {
      res.status(err.status ?? 400).send(err.error)
    })
  }
})

staffRouter.patch('/staff/', async (req, res) => {
  if (!req.body) res.status(400).send({error: 'Se deben aportar en la consulta los campos a modificar'})
  StaffAllowSearch(req)
  .then(() => {
    return StaffAllowUpdate(req)
  })
  .then(() => {
    return StaffGetFilter(req)
  })
  .then((filter) => {
    return Staff.findOneAndUpdate(filter, req.body, {
      new: true,
      runValidators: true
    })
  })
  .then((response) => {
    if (!response) res.status(404).send({error: 'No se encontro el staff que se quiere actualizar'})
    else res.status(200).send(response)
  })
  .catch((err) => {
    res.status(err.status ?? 500).send(err.error)
  })
})

staffRouter.delete('/staff/:id', async (req, res) => {
  
})

staffRouter.delete('/staff/', async (req, res) => {

})