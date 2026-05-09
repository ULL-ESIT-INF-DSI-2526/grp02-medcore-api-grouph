import express from "express";
import { Record, RecordDocumentInterface } from "../models/record.js";
import { Staff } from "../models/staff.js";
import { patientRouter } from "./patient.js"
import { staffRouter } from "./staff.js"
import { medicationRouter } from "./medication.js"
import { MedicationPrescription } from "../models/record.js";
import { Patient } from "../models/patient.js";
import { RecordFilter } from "../types/RecordFilter.js";
import { Medication, MedicationDocumentInterface } from "../models/medication.js";
import { PatientDocumentInterface } from "../models/patient.js";
import { StaffDocumentInterface } from "../models/staff.js";

export const recordRouter = express.Router();

async function getIdFromDni(dni: number): Promise<string> {
  const patient :PatientDocumentInterface | null = await Patient.findOne({
    identificationNumber: String(dni),
  })

  if (!patient) {
    throw new Error("No se ha encontrado ningún paciente con ese DNI");
  }

  return patient._id.toString();
}

async function getIdFromMedicalNumber(medicalNumber: number): Promise<string> {
  const staff: StaffDocumentInterface | null = await Staff.findOne({ medicalNumber });

  if (!staff) {
    throw new Error("No se ha encontrado ningún staff con ese medicalNumber");
  }

  if (staff.status !== "Activo") {
    throw new Error("El médico con el medicalNumber proporcionado no está activo");
  }

  return staff._id.toString();
}

async function manageMedicationPrescription(
  medicationPrescription: MedicationPrescription,
  startDate: Date,
  addition: boolean = false
): Promise<void> {
  const medicationId = medicationPrescription.medicationId.toString();
  const dose = medicationPrescription.dose.quantity;

  const medication: MedicationDocumentInterface | null = await Medication.findById(medicationId);

  if (!medication) {
    throw new Error(`No se ha encontrado el medicamento con ID ${medicationId}`);
  }

  if (medication.stock < dose) {
    throw new Error(
      `No hay suficiente stock del medicamento ${medication.comercialName} para la dosis prescrita`
    );
  }

  if (medication.expireDate < startDate) {
    throw new Error(
      `El medicamento ${medication.comercialName} está caducado para la fecha de inicio del registro`
    );
  }

  let new_stock :number = 0 
  if (!addition) {
    new_stock = medication.stock - dose;
  } else {
    new_stock = medication.stock + dose
  }
  const updated = await Medication.findByIdAndUpdate(medicationId,
    { $inc:{ stock: new_stock } }, 
    { new: true, runValidators: true }
  )

  if (!updated) {
    throw new Error(
      `No se ha podido actualizar el stock del medicamento ${medication.comercialName}. Es posible que no haya suficiente stock disponible.`
    );
  }
}

async function computeTotalPrice(prescriptions: MedicationPrescription[]): Promise<number> {
  let result = 0
  for (const prescription of prescriptions) {
    const medication = await Medication.findById(prescription.medicationId)
    if (medication)
      result += (prescription.dose.quantity / medication.dose.quantity) * medication.price
  }

  return result
}



recordRouter.post('/records', async (req, res) => {
  let doctorId  
  let pacientId

  if (!req.body.identificationNumber || !req.body.medicalNumber) 
    return res.status(400).send({ error: "Faltan campos obligatorios en la query" })
  
  const dni = req.body.identificationNumber
  const medicalNumber = req.body.medicalNumber
  const medicationPrescriptions: MedicationPrescription[] = req.body.medications ?? []
 
  try {
    doctorId  = await getIdFromMedicalNumber(medicalNumber)
    pacientId = await getIdFromDni(dni)
  } catch (error) {
    return res.status(404).send({ error: error })
  }

  try {
    for (const medicationPrescription of medicationPrescriptions) {
      await manageMedicationPrescription(
        medicationPrescription,
        new Date(req.body.startDate)
      )
    }  
  } catch (error) {
    res.status(404).send({ error: error })
  } 
  
  const totalPrice = await computeTotalPrice(medicationPrescriptions)
  try {
    const record = new Record({
      ...req.body,
      pacientId,
      doctorId,
      totalPrice
    })
  
    await record.save()
    return res.status(201).send(record)
  } catch (error) {
    return res.status(400).send({
      error: error 
    })
  }
})


recordRouter.get("/records/patient", async (req, res) => {
  if (!req.query.identificationNumber) {
    return res.status(400).send("No se ha indicado el id del paciente")
  } else {
    try {
      const patient: PatientDocumentInterface | null = await Patient.findOne({ identificationNumber: req.query.identificationNumber as string });
      if (!patient) {
        return res.status(404).send("No se ha encontrado paciente con ese ID");
      } else {
        const records = await Record.find({ pacientId: patient._id })
                                    .sort({ startDate: 1 });  // Registros más antiguos primero
        if(records.length > 0) {
          return res.status(200).send(records);
        } else {
          return res.status(404).send("No se han encontrado registros de ese paciente");
        }
      }
      
    } catch (error) {
      console.error(error)
      return res.status(500).send(error)
    }
  }
})

recordRouter.get("/records/:id", async (req, res) => {
  try {
    const record = await Record.findById(req.params.id);
    
    if (!record) {
      res.status(404).send("No se ha encontrado ningún registro con esa ID");
    } else {
      res.status(200).send(record);
    }
  } catch (error) {
    res.status(500).send(error);
  }
})

recordRouter.get("/records", async (req, res) => {
  const { startDate, endDate, type } = req.query;

  // Comprobamos que se han recibido las fechas
  if (!startDate || !endDate) {
    return res.status(400).send({
      error: "No se han proporcionado startDate y endDate"
    })
  }

  // Comprobamos que se hayan pasado strings
  if (typeof startDate !== "string" || typeof endDate !== "string") {
    return res.status(400).send({
      error: "startDate y endDate deben ser strings"
    })
  }

  // Pasamos lo sstrings a fechas
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Comprobamos que start sea menor
  if (start > end) {
    return res.status(400).send({
      error: "startDate no puede ser mayor que endDate"
    })
  }

  // Filtro obligatorio
  const filter: RecordFilter = {
    startDate: { $gte: start, $lte: end },
  }

  // Filtro opcional
  if (type) {
    if (typeof type == "string" && type == "Ambulatoria" || type == "Hospitalaria") {
      filter.type = type
    } else {
      return res.status(400).send("Filtro incorrecto");
    }
  }

  try {
    const records = await Record.find(filter).sort({ startDate: 1 });

    if (records.length === 0) {
      return res.status(404).send({ error: "No se han encontrado registros" });
    }

    return res.status(200).send(records);

  } catch (error) {
    return res.status(500).send(error);
  }
})

recordRouter.delete("/records/:id", async (req, res) => {
  if (!req.params.id) {
    res.status(400).send("No se ha pasado la ID del registrto como parametro")
  } 
  const record :RecordDocumentInterface | null = await Record.findById(req.params.id)
  if (!record) {
    res.status(404).send({ error: "No se ha encontrado ningún registro con esa ID" })
  } else {
    const medications = record.medications
    /// Miramos si el registro tiene medicamentos prescritos para devolver el stock
    if (medications) {
      medications.forEach((prescription) => {
        const medicationId = prescription.medicationId.toString();
        const dose = prescription.dose.quantity;
        Medication.findById(medicationId)
        .then((medication) => {
          if (!medication) {
            res.status(500).send({ error: `No se ha encontrado el medicamento con ID ${medicationId}` })
          } else {
            Medication.findByIdAndUpdate(medicationId, {stock: medication.stock as number + dose})
            .catch((err) => {
              res.status(500).send({ error: err })
            })
          }
        })
        .catch((err) => {
          res.status(404).send({ error: err })
        })
      })
    }

    Record.findByIdAndDelete(req.params.id)
    .then((record) => {
      res.status(204).send(record)
    })
    .catch((err) => {
      res.status(500).send({ error: err })
    })
  }
})

recordRouter.patch("/records/:id", async (req, res) => {
  if (!req.params.id) {
    res.status(400).send("No se ha pasado la ID del registrto como parametro")
  }

  // Campos que permitimos actualizar
  const allowedUpdates = ["type", "endDate", "reason", "diagnostic", "medications", "status", "totalPrice"];
  const actualUpdates = Object.keys(req.body);
  const isValidUpdate = actualUpdates.every((update) => 
    allowedUpdates.includes(update)
  )

  if (!isValidUpdate) {
    res.status(400).send({ error: "Update no permitida" });
  } else {
    try {
      const record = await Record.findById(req.params.id);
      if (!record) {
        res.status(404).send("No se ha encontrado ningún registro con ese ID")
      } else {
        let totalPrice: number = 0
        if (req.body.medication) {
          /// Restauración
          const medicationPrescriptions: MedicationPrescription[] = record.medications || []
          for (const prescription of medicationPrescriptions) {
            await manageMedicationPrescription(
              prescription,
              record.startDate,
              true
            )
          }
          /// Nueva prescripcion
          const newMedicationPrescriptions: MedicationPrescription[] = req.body.medications || []
          for (const prescription of newMedicationPrescriptions) {
            await manageMedicationPrescription(
              prescription,
              req.body.startDate || record.startDate,
              false
            )
          }          
          totalPrice = await computeTotalPrice(newMedicationPrescriptions)
        } else {
          totalPrice = await computeTotalPrice(record.medications || [])
        }

        const updatedRecord = await Record.findByIdAndUpdate(
          req.params.id,
          { ...req.body, totalPrice },
          { new: true, runValidators: true }
        )

        if (!updatedRecord) {
          res.status(404).send("No se ha encontrado ningún registro con ese ID")
        } else {
          res.status(200).send(updatedRecord)
        }
      }
    } catch (error) {
      res.status(500).send({ error: error })
    }
  }
})