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

/**
 * Obtiene el ID de un paciente a partir de su DNI
 * @param dni - Número de identificación del paciente
 * @returns Promise<string> - Promesa que se resuelve con el ID del paciente, o se rechaza con un error si no se ha encontrado ningún paciente con ese DNI
 */
async function getIdFromDni(dni: number): Promise<string> {
  const patient :PatientDocumentInterface | null = await Patient.findOne({
    identificationNumber: String(dni),
  })

  if (!patient) {
    throw new Error("No se ha encontrado ningún paciente con ese DNI");
  }

  return patient._id.toString();
}

/**
 * Obtiene el ID de un miembro del staff a partir de su número médico
 * @param medicalNumber - Número médico del miembro del staff
 * @returns Promise<string> - Promesa que se resuelve con el ID del miembro del staff, o se rechaza con un error si no se ha encontrado ningún miembro del staff con ese número médico, o si el miembro del staff encontrado no está activo
 */
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

/**
 * Gestiona la prescripción de un medicamento, actualizando el stock del medicamento en función de la dosis prescrita. Si addition es false, se resta la dosis al stock (prescripción normal). Si addition es true, se suma la dosis al stock (devolución de medicamento al cancelar o modificar un registro).
 * @param medicationPrescription - Objeto con la información de la prescripción del medicamento (ID del medicamento y dosis prescrita)
 * @param startDate - Fecha de inicio del registro médico al que se asocia la prescripción (para comprobar que el medicamento no está caducado en esa fecha)
 * @param addition - Booleano que indica si se debe sumar la dosis al stock (true) o restarla (false)
 * @returns Promise<void> - Promesa que se resuelve cuando se ha gestionado la prescripción, o se rechaza con un error si no se ha podido gestionar (por ejemplo, si no hay suficiente stock o el medicamento está caducado)
 */
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

/**
 * Calcula el precio total de una lista de prescripciones de medicamentos
 * @param prescriptions - Lista de objetos con la información de las prescripciones de medicamentos (ID del medicamento y dosis prescrita)
 * @returns Promise<number> - Promesa que se resuelve con el precio total de las prescripciones, o se rechaza con un error si no se ha podido calcular el precio (por ejemplo, si no se ha encontrado algún medicamento)
 */
async function computeTotalPrice(prescriptions: MedicationPrescription[]): Promise<number> {
  let result = 0
  for (const prescription of prescriptions) {
    const medication = await Medication.findById(prescription.medicationId)
    if (medication)
      result += (prescription.dose.quantity / medication.dose.quantity) * medication.price
  }

  return result
}

/**
 * @swagger
 * /records:
 *   post:
 *     summary: Crea un nuevo registro médico
 *     tags: [Records]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               identificationNumber:
 *                 type: number
 *                 description: DNI del paciente al que se le asignará el registro médico
 *               medicalNumber:
 *                 type: number
 *                 description: Número médico del doctor al que se le asignará el registro médico
 *               type:
 *                 type: string
 *                 enum: [Ambulatoria, Hospitalaria]
 *                 description: Tipo de registro médico (ambulatorio u hospitalario)
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha de inicio del registro médico (en formato ISO 8601)
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha de finalización del registro médico (en formato ISO 8601)
 *               reason:
 *                 type: string
 *                 description: Motivo del registro médico
 *               diagnostic:
 *                 type: string
 *                 description: Diagnóstico del registro médico
 *               medications:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/MedicationPrescription'
 *                 description: Lista de medicamentos prescritos en el registro médico
 *               totalPrice:
 *                 type: number
 *                 description: Precio total de las prescripciones de medicamentos asociadas al registro médico
 *     responses:
 *       201:
 *         description: Registro médico creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Record'
 *       400:
 *         description: Error en la solicitud (por ejemplo, falta de campos obligatorios o formato incorrecto)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error400'
 *       404:
 *         description: No se ha encontrado ningún paciente con el DNI proporcionado, o ningún doctor con el número médico proporcionado, o no hay suficiente stock de algún medicamento prescrito
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
    return res.status(404).send({ error: error })
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

/**
 * @swagger
 * /records/patient:
 *   get:
 *     summary: Obtiene los registros médicos de un paciente a partir de su número de identificación
 *     tags: [Records]
 *     parameters:
 *       - in: query
 *         name: identificationNumber
 *         schema:
 *           type: number
 *         required: true
 *         description: Número de identificación del paciente (DNI)
 *     responses:
 *       200:
 *         description: Registros médicos obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Record'
 *       400:
 *         description: No se ha proporcionado el número de identificación del paciente, o el formato es incorrecto
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error400'
 *       404:
 *         description: No se ha encontrado ningún paciente con el número de identificación proporcionado, o el paciente no tiene registros médicos asociados
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

/**
 * @swagger
 * /records/{id}:
 *   get:
 *     summary: Obtiene un registro médico a partir de su ID
 *     tags: [Records]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del registro médico a obtener
 *     responses:
 *       200:
 *         description: Registro médico obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Record'
 *       404:
 *         description: No se ha encontrado ningún registro médico con el ID proporcionado
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

/**
 * @swagger
 * /records:
 *   get:
 *     summary: Obtiene los registros médicos que comienzan en un rango de fechas determinado, y opcionalmente filtra por tipo de registro (ambulatorio u hospitalario)
 *     tags: [Records]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         required: true
 *         description: Fecha de inicio del rango (en formato ISO 8601). Se obtendrán los registros médicos cuyo campo startDate esté entre esta fecha y endDate.
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         required: true
 *         description: Fecha de fin del rango (en formato ISO 8601). Se obtendrán los registros médicos cuyo campo startDate esté entre startDate y esta fecha.
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [Ambulatoria, Hospitalaria]
 *         required: false
 *         description: Tipo de registro médico (ambulatorio u hospitalario). Si se proporciona, se filtrarán los registros médicos por este tipo además de por el rango de fechas.
 *     responses:
 *       200:
 *         description: Registros médicos obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Record'
 *       400:
 *         description: No se han proporcionado las fechas de inicio y fin, o el formato de las fechas es incorrecto, o startDate es mayor que endDate, o el valor del filtro type no es válido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error400'
 *       404:
 *         description: No se han encontrado registros médicos que cumplan los criterios de búsqueda
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

/**
 * @swagger
 * /records/{id}:
 *   delete:
 *     summary: Elimina un registro médico a partir de su ID, devolviendo el stock de los medicamentos prescritos en el registro si el registro tiene medicamentos asociados
 *     tags: [Records]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del registro médico a eliminar
 *     responses:
 *       204:
 *         description: Registro médico eliminado exitosamente
 *       404:
 *         description: No se ha encontrado ningún registro médico con el ID proporcionado
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

/**
 * @swagger
 * /records/{id}:
 *   patch:
 *     summary: Actualiza un registro médico a partir de su ID, permitiendo modificar los campos endDate, reason, diagnostic, medications (con la correspondiente gestión del stock de medicamentos), type y status. No se permite modificar el paciente ni el doctor asociados al registro.
 *     tags: [Records]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del registro médico a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 description: Nueva fecha de finalización del registro médico (en formato ISO 8601)
 *               reason:
 *                 type: string
 *                 description: Nuevo motivo del registro médico
 *               diagnostic:
 *                 type: string
 *                 description: Nuevo diagnóstico del registro médico
 *               medications:
 *                 type: array
 *                 description: Nueva lista de medicamentos prescritos en el registro médico. Si se incluye este campo, se actualizará la prescripción de medicamentos del registro médico, gestionando el stock de medicamentos tanto para los medicamentos que se añaden como para los que se eliminan respecto a la prescripción anterior.
 *               type:
 *                 type: string
 *                 enum: [Ambulatoria, Hospitalaria]
 *                 description: Nuevo tipo de registro médico (ambulatorio u hospitalario)
 *               status:
 *                 type: string
 *                 enum: [abierto, cerrado]
 *                 description: Nuevo estado del registro médico (abierto o cerrado)
 *     responses:
 *       200:
 *         description: Registro médico actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Record'
 *       400:
 *         description: No se ha proporcionado ningún campo a actualizar, o el formato de los campos es incorrecto, o se han intentado modificar campos no permitidos (paciente o doctor), o el valor del campo type o status no es válido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error400'
 *       404:
 *         description: No se ha encontrado ningún registro médico con el ID proporcionado, o no se ha encontrado algún medicamento incluido en la actualización, o no hay suficiente stock para alguno de los medicamentos añadidos en la actualización
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
        if (req.body.medications) {
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