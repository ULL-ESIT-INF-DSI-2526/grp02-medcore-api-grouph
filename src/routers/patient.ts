import express from 'express';
import { Patient } from '../models/patient.js';
import { Record } from '../models/record.js';
import { PatientFilter } from '../types/PatientFilter.js';

export const patientRouter = express.Router();

/**
 * @swagger
 * /patients:
 *   post:
 *    summary: Crear un nuevo paciente
 *    tags: [Patients]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Patient'
 *    responses:
 *      201:
 *        description: Paciente creado exitosamente
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Patient'
 *      500:
 *        description: Error interno del servidor
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Error500'
 */
patientRouter.post('/patients', async (req, res) => {
  const patient = new Patient(req.body);
  try {
    await patient.save();
    res.status(201).send(patient);
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * @swagger
 * /patients:
 *   get:
 *    summary: Obtener pacientes por nombre o número de identificación
 *    tags: [Patients]
 *    parameters:
 *      - in: query
 *        name: name
 *        schema:
 *          type: string
 *        description: Nombre del paciente a buscar
 *      - in: query
 *        name: identificationNumber
 *        schema:
 *          type: string
 *        description: Número de identificación del paciente a buscar
 *    responses:
 *      200:
 *        description: Lista de pacientes encontrados
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Patient'
 *      404:
 *        description: No se ha encontrado ningún paciente con los criterios de búsqueda proporcionados
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Error404'
 *      500:
 *        description: Error interno del servidor
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Error500'
 */
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

/**
 * @swagger
 * /patients/{id}:
 *   get:
 *    summary: Obtener un paciente por ID
 *    tags: [Patients]
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: string
 *          description: ID de mongodb del paciente a obtener
 *    responses:
 *      200:
 *        description: Paciente encontrado con exito
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              $ref: '#/components/schemas/Patient'
 *      404:
 *        description: El paciente no existe para el ID proporcionado
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Error404'
 *      500:
 *        description: Error interno del servidor
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Error500'
 */
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

/**
 * @swagger
 * /patients:
 *   patch:
 *    summary: Actualizar un paciente por número de identificación
 *    tags: [Patients]
 *    parameters:
 *      - in: query
 *        name: identificationNumber
 *        required: true
 *        schema:
 *          type: string
 *          description: Número de identificación del paciente a actualizar
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              contactInformation:
 *                type: object
 *                properties:
 *                  phone:
 *                    type: number
 *                    description: Nuevo número de teléfono del paciente
 *                  email:
 *                    type: string
 *                    description: Nuevo correo electrónico del paciente
 *                  address:
 *                    type: string
 *                    description: Nueva dirección del paciente
 *              knownAllergies:
 *                type: array
 *                description: Nueva lista de alergias del paciente
 *              status:
 *                type: string
 *                description: Nuevo estado del paciente
 *    responses:
 *      200:
 *        description: Paciente actualizado con éxito
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              $ref: '#/components/schemas/Patient'
 *      400:
 *        description: Datos de actualización no válidos
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Error400'
 *      404:
 *        description: Paciente no encontrado
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Error404'
 *      500:
 *        description: Error interno del servidor
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Error500'
 */
  
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

/**
 * @swagger
 * /patients/{id}:
 *   patch:
 *    summary: Actualizar un paciente por ID
 *    tags: [Patients]
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: string
 *          description: ID de mongodb del paciente a actualizar
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              contactInformation:
 *                type: object
 *                properties:
 *                  phone:
 *                    type: number
 *                    description: Nuevo número de teléfono del paciente
 *                  email:
 *                    type: string
 *                    description: Nuevo correo electrónico del paciente
 *                  address:
 *                    type: string
 *                    description: Nueva dirección del paciente
 *              knownAllergies:
 *                type: array
 *                description: Nueva lista de alergias del paciente
 *              status:
 *                type: string
 *                description: Nuevo estado del paciente
 *   responses:
 *     200:
 *       description: Paciente actualizado con éxito
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             $ref: '#/components/schemas/Patient'
 *     400:
 *       description: Datos de actualización no válidos
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error400'
 *     404:
 *       description: Paciente no encontrado
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error404'
 *     500:
 *       description: Error interno del servidor
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error500'
 */

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

  /**
  * @swagger
  * /patients:
  *   delete:
  *     summary: Eliminar un paciente por número de identificación junto a todo su historial medico
  *     tags: [Patients]
  *     parameters:
  *       - in: query
  *         name: identificationNumber
  *         required: true
  *         schema:
  *           type: string
  *           description: Número de identificación del paciente a eliminar
  *     responses:
  *       200:
  *         description: Paciente eliminado con éxito
  *         content:
  *           application/json:
  *             schema:
  *               type: object
  *               $ref: '#/components/schemas/Patient'
  *       400:
  *         description: Número de identificación del paciente es requerido
  *         content:
  *           application/json:
  *             schema:
  *               $ref: '#/components/schemas/Error400'
  *       404:
  *         description: Paciente no encontrado
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

  /**
   * @swagger
   * /patients/{id}:
   *   delete:
   *    summary: Eliminar un paciente por ID de mongodb junto a todo su historial medico
   *    tags: [Patients]
   *    parameters:
   *      - in: path
   *        name: id
   *        required: true
   *        schema:
   *          type: string
   *          description: ID de mongodb del paciente a eliminar
   *    responses:
   *      200:
   *        description: Paciente eliminado con éxito
   *        content:
   *          application/json:
   *            schema:
   *              type: object
   *              $ref: '#/components/schemas/Patient'
   *      400:
   *        description: ID del paciente es requerido
   *        content:
   *          application/json:
   *            schema:
   *              $ref: '#/components/schemas/Error400'
   *      404:
   *        description: Paciente no encontrado
   *        content:
   *          application/json:
   *            schema:
   *              $ref: '#/components/schemas/Error404'
   *      500:
   *        description: Error interno del servidor
   *        content:
   *          application/json:
   *            schema:
   *              $ref: '#/components/schemas/Error500'
   */
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



