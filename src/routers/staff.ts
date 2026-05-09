import express from 'express';
import { Staff } from '../models/staff.js';
import { ContactInfo } from '../interfaces/ContactInfo.js';

export const staffRouter = express.Router();
type StaffSearch = {name?: string, specialty?: string}

/**
 * Funciones auxiliares para el router de staff
 */

/**
 * Funcion que obtiene el filtro de búsqueda a aplicar en una consulta de búsqueda o actualización de staff a partir de los query params de la consulta
 * @param req - Express request con los query params de búsqueda
 * @returns - promesa que resuelve con el filtro de búsqueda a aplicar en la consulta de búsqueda o actualización de staff
 */
function StaffGetFilter(req :express.Request) :Promise<StaffSearch> {
  return new Promise<StaffSearch>((resolve) => {
    let filter :StaffSearch = {}
    if (req.query.name) filter = {name: req.query.name.toString()}
    if (req.query.specialty) filter = {specialty: req.query.specialty.toString()}
    resolve(filter)
  }) 
}
/**
 * Funcion que comprueba que los campos a modificar en una consulta de actualización de staff son válidos
 * @param req - Express request con los campos a modificar en el body de la consulta
 * @returns - promesa que resuelve con true si los campos a modificar son válidos, o rechaza con un error si no lo son
 */
function StaffAllowUpdate(req :express.Request) :Promise<boolean> {
  return new Promise<boolean>((resolve, rejected) => {
    const allowedUpdates = ['specialty', 'professionalCategory', 'shift', 'consultNumber', 'yearsExperience', 'contactInfo', 'state']
    const actualUpdate = Object.keys(req.body)
    const isValidUpdate = actualUpdate.every((update) => allowedUpdates.includes(update)) 
    if (!isValidUpdate) rejected({ status: 412, error: 'Los campos de la consulta no se pueden modificar'})
    else resolve(true)
  })
}

/**
 * Funcion que comprueba que los campos de búsqueda en una consulta de búsqueda de staff son válidos
 * @param req - Express request con los query params de búsqueda
 * @returns - promesa que resuelve con true si los campos de búsqueda son válidos, o rechaza con un error si no lo son
 */
function StaffAllowSearch(req :express.Request) :Promise<boolean> {
  return new Promise<boolean>((resolve, rejected) => {
    if (!req.query) resolve(true)
      
    const allowedQueries = ['name', 'specialty']
    for (const query in req.query) {
      if (!allowedQueries.includes(query)) 
        rejected({status: 400, error: `Query ${query} no permitido`})
    }
    resolve(true)
  }) 
}

/**
 * @swagger
 * /staff:
 *   post:
 *     summary: Crear un nuevo miembro del staff
 *     tags: [Staff]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Staff'
 *     responses:
 *       201:
 *         description: Miembro del staff creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Staff'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error500'
 */
staffRouter.post('/staff', async (req, res) => {
  const staff = new Staff(req.body);
  try {
    await staff.save();
    res.status(201).send(staff);
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * @swagger
 * /staff/{id}:
 *   get:
 *     summary: Obtener un miembro del staff por ID
 *     tags: [Staff]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del miembro del staff a obtener
 *     responses:
 *       200:
 *         description: Miembro del staff encontrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Staff'
 *       404:
 *         description: No se ha encontrado ningún miembro del staff con esa ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error404'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error500'
 */
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

/**
 * @swagger
 * /staff:
 *   get:
 *     summary: Obtener miembros del staff con filtros de búsqueda
 *     tags: [Staff]
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Nombre del miembro del staff a buscar
 *       - in: query
 *         name: specialty
 *         schema:
 *           type: string
 *         description: Especialidad médica del miembro del staff a buscar
 *     responses:
 *       200:
 *         description: Miembros del staff encontrados exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Staff'
 *       404:
 *         description: No se han encontrado miembros del staff con los filtros proporcionados
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error404'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error500'
 */
staffRouter.get('/staff/', async (req, res) => {
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

/**
 * @swagger
 * /staff/{id}:
 *   patch:
 *     summary: Actualizar un miembro del staff por ID
 *     tags: [Staff]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del miembro del staff a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               specialty:
 *                 type: string
 *                 description: Nueva especialidad médica del miembro del staff
 *               professionalCategory:
 *                 type: string
 *                 description: Nueva categoría profesional del miembro del staff (médico, residente, enfermero, etc.)
 *               shift:
 *                 type: string
 *                 description: Nuevo turno de trabajo del miembro del staff (mañana, tarde, noche, rotatorio)
 *               consultNumber:
 *                 type: number
 *                 description: Nuevo número de consultas atendidas por el miembro del staff
 *               yearsExperience:
 *                 type: number
 *                 description: Nuevos años de experiencia del miembro del staff en su especialidad
 *               contactInfo:
 *                 type: object
 *                 description: Nueva información de contacto del miembro del staff (dirección, teléfono, correo electrónico)
 *               status:
 *                 type: string
 *                 description: Nuevo estado del miembro del staff (activo, inactivo)
 *     responses:
 *       200:
 *         description: Miembro del staff actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Staff'
 *       400:
 *         description: Campos a modificar no permitidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error400'
 *       404:
 *         description: No se encontro el staff que se quiere actualizar
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error404'
 *       412:
 *         description: Las condiciones para la actualización no se cumplen
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error500'
 */
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

/**
 * @swagger
 * /staff:
 *   patch:
 *     summary: Actualizar miembros del staff con filtros de búsqueda
 *     tags: [Staff]
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Nombre del miembro del staff a actualizar
 *       - in: query
 *         name: specialty
 *         schema:
 *           type: string
 *         description: Especialidad médica del miembro del staff a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               specialty:
 *                 type: string
 *                 description: Nueva especialidad médica del miembro del staff
 *               professionalCategory:
 *                 type: string
 *                 description: Nueva categoría profesional del miembro del staff (médico, residente, enfermero, etc.)
 *               shift:
 *                 type: string
 *                 description: Nuevo turno de trabajo del miembro del staff (mañana, tarde, noche, rotatorio)
 *               consultNumber:
 *                 type: number
 *                 description: Nuevo número de consultas atendidas por el miembro del staff
 *               yearsExperience:
 *                 type: number
 *                 description: Nuevos años de experiencia del miembro del staff en su especialidad
 *               contactInfo:
 *                 type: object
 *                 description: Nueva información de contacto del miembro del staff (dirección, teléfono, correo electrónico)
 *               status:
 *                 type: string
 *                 description: Nuevo estado del miembro del staff (activo, inactivo)
 *     responses:
 *       200:
 *         description: Miembros del staff actualizados exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Staff'
 *       400:
 *         description: Campos a modificar no permitidos o filtros de búsqueda no permitidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error400'
 *       404:
 *         description: No se encontro el staff que se quiere actualizar
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error404'
 *       412:
 *         description: Las condiciones para la actualización no se cumplen
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error500'
 */
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

/**
 * @swagger
 * /staff/{id}:
 *   delete:
 *     summary: Eliminar un miembro del staff por ID
 *     tags: [Staff]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del miembro del staff a eliminar
 *     responses:
 *       200:
 *         description: Miembro del staff eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Staff'
 *       400:
 *         description: ID no proporcionado o no válido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error400'
 *       404:
 *         description: No se encontro a ningún miembro del staff con el id proporcionado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error404'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error500'
 */
staffRouter.delete('/staff/:id', async (req, res) => {
  if (!req.params.id) res.status(400).send({ error: "Se debe proporcionar un id" })
  else {
    Staff.findById(req.params.id)
    .then((staff) => {
      if (!staff) {
        res.status(404).send({ error: "No se encontro a ningún miembro del staff con el id proporcionado" })
        return
      } else {
        return Staff.findByIdAndDelete(staff.id)
      }
    })
    .then((staff) => {
      res.status(200).send(staff)
    })
    .catch((error) => {
      res.status(500).send(error)
    })
  }
})

/**
 * @swagger
 * /staff:
 *   delete:
 *     summary: Eliminar miembros del staff con filtros de búsqueda
 *     tags: [Staff]
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Nombre del miembro del staff a eliminar
 *       - in: query
 *         name: specialty
 *         schema:
 *           type: string
 *         description: Especialidad médica del miembro del staff a eliminar
 *     responses:
 *       200:
 *         description: Miembros del staff eliminados exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: 
 *                 $ref: '#/components/schemas/Staff'
 *       404:
 *         description: No se encontro a ningún miembro del staff con los filtros proporcionados
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error404'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error500'
 */
staffRouter.delete('/staff/', async (req, res) => {
  StaffAllowSearch(req)
  .then(() => {
    return StaffGetFilter(req)
  })
  .then((filter) => {
    return Staff.deleteMany(filter)
  })
  .then((deleted) => {
    if (deleted.deletedCount === 0) 
      res.status(404).send({ error: "No se encontro a ningún miembro del staff con los filtros proporcionados" })
    else
      res.status(200).send(deleted)
  })
  .catch((error) => {
    res.status(error.status ?? 500).send(error.error)
  })
})

