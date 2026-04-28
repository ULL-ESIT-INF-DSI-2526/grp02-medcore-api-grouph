import express from "express";
import { Medication } from "../models/medication.js";

export const medicationRouter = express.Router();

/**
 * POST de Medication
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
 * GET por ID de Medication
 */
medicationRouter.get("/medication/:id", async (req, res) => {
  try {
    const medication = await Medication.findById(req.params.id);

    if (!medication) {
      res.status(404).send("No se ha encontrado medicación con esa ID");
    } else {
      res.status(200).send(medication);
    }

  } catch (error) {
    res.status(500).send(error);
  }
})