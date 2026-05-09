import express from "express"
import { Medication } from "../models/medication.js"
import { MedicationFilter } from "../types/MedicationFilter.js";
import { Record } from "../models/record.js";

export const medicationRouter = express.Router();

/**
 * @swagger
 * /medication:
 *   post:
 *     summary: Crea un nuevo medicamento
 *     tags: [Medication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Medication'
 *     responses:
 *       201:
 *         description: Medicamento creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Medication'
 *       400:
 *         description: Error en la solicitud
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error400'
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error500'
 */
medicationRouter.post("/medication", async (req, res) => {
  const medication = new Medication(req.body);

  try {
    await medication.save();
    res.status(201).send(medication);
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * @swagger
 * /medication/{id}:
 *   get:
 *     summary: Obtiene un medicamento por su ID
 *     tags: [Medication]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del medicamento a obtener
 *     responses:
 *       200:
 *         description: Medicamento encontrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Medication'
 *       404:
 *         description: No se ha encontrado medicación con esa ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error404'
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error500'
 */
medicationRouter.get("/medication/:id", async (req, res) => {
  try {
    const medication = await Medication.findById(req.params.id);

    if (!medication) {
      res.status(404).send({ error: "No se ha encontrado medicación con esa ID" });
    } else {
      res.status(200).send(medication);
    }

  } catch (error) {
    res.status(500).send(error);
  }
})

/**
 * @swagger
 * /medication:
 *   get:
 *     summary: Obtiene medicamentos por filtros
 *     tags: [Medication]
 *     parameters:
 *       - in: query
 *         name: comercialName
 *         schema:
 *           type: string
 *         description: Nombre comercial del medicamento a buscar
 *       - in: query
 *         name: DCIName
 *         schema:
 *           type: string
 *         description: Denominación Común Internacional del medicamento a buscar
 *       - in: query
 *         name: nationalCode
 *         schema:
 *           type: string
 *         description: Código nacional del medicamento a buscar
 *     responses:
 *       200:
 *         description: Medicamento encontrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Medication'
 *       404:
 *         description: No se ha encontrado medicación con esa ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error404'
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error500'
 */
medicationRouter.get('/medication', async (req, res) => {
  // Selección de filtro de la query
  let filter: MedicationFilter = {};

  if (req.query.comercialName) filter.comercialName = req.query.comercialName as string;
  if (req.query.DCIName) filter.DCIName = req.query.DCIName as string;
  if (req.query.nationalCode) filter.nationalCode = req.query.nationalCode as string;
 
  // Se busca el medicamento
  try {
    const medication = await Medication.find(filter);

    if (medication.length == 0) {
      return res.status(404).send({ error: "No se ha encontrado medicación con esa ID" });
    } else {
      return res.status(200).send(medication);
    }

  } catch (error) {
    return res.status(500).send(error);
  }
})

/**
 * @swagger
 * /medication/{id}:
 *   patch:
 *     summary: Actualiza un medicamento por su ID
 *     tags: [Medication]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del medicamento a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               stock:
 *                 type: number
 *                 description: Nueva cantidad de unidades disponibles en stock
 *               price:
 *                 type: number
 *                 description: Nuevo precio del medicamento
 *               expireDate:
 *                 type: date
 *                 description: Nueva fecha de caducidad del medicamento
 *     responses:
 *       200:
 *         description: Medicamento actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Medication'
 *       400:
 *         description: Error en la solicitud
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error400'
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error500'
 */
medicationRouter.patch("/medication/:id", async (req, res) => {
  if (!req.params.id) {
    res.status(400).send({ error: "No se ha indicado el ID de la medicación" });
  } else if (!req.body) {
    res.status(400).send({ error: "No se ha indicado el body de la petición" });
  } else {

    // Campos que permitimos actualizar
    const allowedUpdates = ["stock", "price", "expireDate"];
    const actualUpdates = Object.keys(req.body);
    const isValidUpdate = actualUpdates.every((update) => 
      allowedUpdates.includes(update)
    )

    if (!isValidUpdate) {
      res.status(400).send({ error: "Update no permitida" });
    } else {

      // Se busca el medicamento
      try {
        const medication = await Medication.findByIdAndUpdate(
          req.params.id, 
          req.body,
          { 
            new: true,  // Hace que se devuelva el objeto nuevo, y no el viejo
            runvalidators: true,
          },
        )

        if (medication) {
          res.send(medication);
        } else {
          res.status(400).send({ error: "No se ha encontrado ningún medicamento con ese ID" });
        }
      } catch (error) {
        res.status(500).send(error);
      }
      
    }
  }
})

/**
 * @swagger
 * /medication:
 *   patch:
 *     summary: Actualiza medicamentos por filtros
 *     tags: [Medication]
 *     parameters:
 *       - in: query
 *         name: comercialName
 *         schema:
 *           type: string
 *         description: Nombre comercial del medicamento a actualizar
 *       - in: query
 *         name: DCIName
 *         schema:
 *           type: string
 *         description: Denominación Común Internacional del medicamento a actualizar
 *       - in: query
 *         name: nationalCode
 *         schema:
 *           type: string
 *         description: Código nacional del medicamento a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               stock:
 *                 type: number
 *                 description: Nueva cantidad de unidades disponibles en stock
 *               price:
 *                 type: number
 *                 description: Nuevo precio del medicamento
 *               expireDate:
 *                 type: date
 *                 description: Nueva fecha de caducidad del medicamento
 *     responses:
 *       200:
 *         description: Medicamento actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Medication'
 *       400:
 *         description: Error en la solicitud
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error400'
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error500'
 */
medicationRouter.patch("/medication", async (req, res) => {
  if (!req.body) {
    return res.status(400).send({ error: "No se ha indicado el body de la petición" });
  } else {

    // Campos que permitimos actualizar
    const allowedUpdates = ["stock", "price", "expireDate"];
    const actualUpdates = Object.keys(req.body);
    const isValidUpdate = actualUpdates.every((update) => 
      allowedUpdates.includes(update)
    )

    if (!isValidUpdate) {
      return res.status(400).send({ error: "Update no permitida" });
    } else {

  // Selección de filtro de la query
  let filter: MedicationFilter = {};

  if (req.query.comercialName) filter.comercialName = req.query.comercialName as string;
  if (req.query.DCIName) filter.DCIName = req.query.DCIName as string;
  if (req.query.nationalCode) filter.nationalCode = req.query.nationalCode as string;

      // Se busca el medicamento
      try {
        const medication = await Medication.findOneAndUpdate(
          filter, 
          req.body,
          { 
            new: true,  // Hace que se devuelva el objeto nuevo, y no el viejo
            runvalidators: true,
          },
        )

        if (medication) {
          return res.send(medication);
        } else {
          return res.status(400).send({ error: "No se ha encontrado ningún medicamento con ese ID" });
        }
      } catch (error) {
        return res.status(500).send(error);
      }
      
    }
  }
})

/**
 * @swagger
 * /medication/{id}:
 *   delete:
 *     summary: Elimina un medicamento por su ID
 *     tags: [Medication]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del medicamento a eliminar
 *     responses:
 *       200:
 *         description: Medicamento eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Medication'
 *       400:
 *         description: No se ha encontrado ningún medicamento con ese ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error400'
 *       404:
 *         description: No se ha encontrado ningún medicamento con ese ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error404'
 *       412:
 *         description: No se puede borrar porque el medicamento esta en un registro con estado 'abierto'
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error500'
 */
medicationRouter.delete("/medication/:id", async (req, res) => {
  if (!req.params.id) {
    res.status(400).send({ error: "No hay id del medicamento" });
  } else {
    try {
      // Comprobamos que antes de borra la medicación, no exista en ningún registro
      // que tenga dicha medicación y no haya sido dado de alta.
      const medicationInRecords = await Record.findOne({
        medicationId: req.params.id,
        status: "abierto",
      })

      if (medicationInRecords) {
        res.status(412).send({ error: "No se puede borrar porque el medicamento esta en un registro con estado 'abierto'" });
      } else {
        const medication = await Medication.findByIdAndDelete(req.params.id);
        if (!medication) {
          res.status(404).send({ error: "No se ha encontrado ningún medicamento con ese ID" });
        } else {
          res.status(200).send(medication);
        }
      }
    } catch (error) {
      res.status(500).send(error);
    }
  }
})

/**
 * @swagger
 * /medication:
 *   delete:
 *     summary: Elimina medicamentos por filtros
 *     tags: [Medication]
 *     parameters:
 *       - in: query
 *         name: comercialName
 *         schema:
 *           type: string
 *         description: Nombre comercial del medicamento a eliminar
 *       - in: query
 *         name: DCIName
 *         schema:
 *           type: string
 *         description: Denominación Común Internacional del medicamento a eliminar
 *       - in: query
 *         name: nationalCode
 *         schema:
 *           type: string
 *         description: Código nacional del medicamento a eliminar
 *     responses:
 *       200:
 *         description: Medicamento eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Medication'
 *         example:
 *           comercialName: "Paracetamol"
 *           DCIName: "Paracetamol"
 *           nationalCode: "123456"
 *           pharmaceuticalForm: "Comprimido"
 *           dose:
 *             quantity: 500
 *             unit: "mg"
 *           administrationRoute: "Oral"
 *           stock: 100
 *           price: 5.99
 *           prescription: false
 *           expireDate: "2025-12-31"
 *           contraindications: ["Hipersensibilidad al paracetamol", "Insuficiencia hepática grave"]
 *       400:
 *         description: No se ha encontrado ningún medicamento con ese ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error400'
 *       404:
 *         description: No se ha encontrado ningún medicamento con ese ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error404'
 *       412:
 *         description: No se puede borrar porque el medicamento esta en un registro con estado 'abierto'
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error500'
 */
medicationRouter.delete("/medication", async (req, res) => {
    // Selección de filtro de la query
    let filter: MedicationFilter = {};

    if (req.query.comercialName) filter.comercialName = req.query.comercialName as string;
    if (req.query.DCIName) filter.DCIName = req.query.DCIName as string;
    if (req.query.nationalCode) filter.nationalCode = req.query.nationalCode as string;
    try {

      // Buscamos los ids de los medicamentos
      const meds = await Medication.find(filter);
      const medsIds = meds.map((med) => med._id);

      // Comprobamos que antes de borra la medicación, no exista en ningún registro
      // que tenga dicha medicación y no haya sido dado de alta.
      const medicationInRecords = await Record.find({
        medicationId: { $in: medsIds },
        status: "abierto",
      })

      if (medicationInRecords.length > 0) {
        return res.status(412).send({ error: "No se puede borrar porque el medicamento esta en un registro con estado 'abierto'" });
      } else {
        const medication = await Medication.deleteMany(filter);
        if (!medication) {
          return res.status(404).send({ error: "No se ha encontrado ningún medicamento con ese ID" });
        } else {
          return res.status(200).send(medication);
        }
      }
    } catch (error) {
      return res.status(500).send(error);
    }
})