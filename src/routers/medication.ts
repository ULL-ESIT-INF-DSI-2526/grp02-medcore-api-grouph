import express from "express"
import { Medication } from "../models/medication.js"
import { MedicationFilter } from "../types/MedicationFilter.js";
import { Record } from "../models/record.js";

export const medicationRouter = express.Router();

/**
 * POST de Medication
 * Se guarda un medicamento
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
 * GET por ID de Medication (params)
 * Se devuelve un solo medicamento
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
 * GET por nombres o código nacional de Medication (query)
 * Se devuelven varios medicamentos
 */
medicationRouter.get("/medication", async (req, res) => {
  // Selección de filtro de la query
  let filter: MedicationFilter;

  if(req.query.comercialName) {
    filter = { comercialName: req.query.comercialName as string};
  } else if (req.query.DCIName) {
    filter = { DCIName: req.query.DCIName as string};
  } else if (req.query.nationalCode) {
    filter = { nationalCode: req.query.nationalCode as string};
  } else {
    return res.status(400).send({ error: "No se a proporcioando un numbre o el código nacional"});
  }

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
 * PATCH por ID de Medication (params)
 * Se actualiza un solo medicamento
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
    const isValidUpdate = actualUpdates.every((update) => {
      allowedUpdates.includes(update)
    })

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
          res.status(400);
        }
      } catch (error) {
        res.status(500).send(error);
      }
      
    }
  }
})

/**
 * PATCH por nombre o código nacional de Medication (query)
 * Se actualiza un solo medicamento
 */
medicationRouter.patch("/medication/", async (req, res) => {
  if (!req.body) {
    return res.status(400).send({ error: "No se ha indicado el body de la petición" });
  } else {

    // Campos que permitimos actualizar
    const allowedUpdates = ["stock", "price", "expireDate"];
    const actualUpdates = Object.keys(req.body);
    const isValidUpdate = actualUpdates.every((update) => {
      allowedUpdates.includes(update)
    })

    if (!isValidUpdate) {
      return res.status(400).send({ error: "Update no permitida" });
    } else {

      // Selección de filtro de la query
      let filter: MedicationFilter;

      if(req.query.comercialName) {
        filter = { comercialName: req.query.comercialName as string};
      } else if (req.query.DCIName) {
        filter = { DCIName: req.query.DCIName as string};
      } else if (req.query.nationalCode) {
        filter = { nationalCode: req.query.nationalCode as string};
      } else {
        return res.status(400).send({ error: "No se a proporcioando un numbre o el código nacional"});
      }

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
          return res.status(400);
        }
      } catch (error) {
        return res.status(500).send(error);
      }
      
    }
  }
})

/**
 * DELETE por ID de Medication (params)
 * Se borra un único medicamento
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
 * DELETE por nombre o código nacional de Medication (query)
 * Se pueden borrar varios medicamentos
 */
medicationRouter.delete("/medication/:", async (req, res) => {
  // Selección de filtro de la query
    let filter: MedicationFilter;

    if(req.query.comercialName) {
      filter = { comercialName: req.query.comercialName as string};
    } else if (req.query.DCIName) {
      filter = { DCIName: req.query.DCIName as string};
    } else if (req.query.nationalCode) {
      filter = { nationalCode: req.query.nationalCode as string};
    } else {
      return res.status(400).send({ error: "No se a proporcioando un numbre o el código nacional"});
    }
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

      if (medicationInRecords) {
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