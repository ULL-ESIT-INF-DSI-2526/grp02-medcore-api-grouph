import { Document, Schema, model, ObjectId } from 'mongoose'
import { Dose } from '../interfaces/Dose.js'
import { Patient, PatientDocumentInterface } from './patient.js'
import { Staff, StaffDocumentInterface } from './staff.js'
import { Medication, MedicationDocumentInterface } from './medication.js'

/**
 * Interfaces y Schemas para la entidad Record
 */

/**
 * MedicationPrescription define la estructura de un medicamento prescrito en un registro médico, incluyendo el ID del medicamento, la dosis prescrita y la posología.
 */
export interface MedicationPrescription {
  medicationId: string,
  dose :Dose,
  posology: string,
}

/**
 * RecordDocumentInterface define la estructura de un documento de registro médico en la base de datos, incluyendo campos como el ID del paciente, el ID del doctor, el tipo de registro (ambulatorio u hospitalario), las fechas de inicio y fin, la razón de la consulta u hospitalización, el diagnóstico, los medicamentos prescritos, el estado del registro (abierto o cerrado) y el precio total de los medicamentos prescritos.
 */
const MedicationPrescriptionSchema = new Schema<MedicationPrescription>({
  medicationId: {
    type: String,
    required: true,
    ref: 'Medication'
  },
  dose: {
    quantity: {
    type: Number,
    required: true,
    },
    unit: {
      type: String,
      required: true,
      enum: ['mg', 'ml', 'mcg', 'g', 'UI']
    }
  },
  posology: {
    type: String,
    required: true,
    validate: (value: string) => {
      if (value === '') throw new Error(`Debe existir una posología para el medicamento prescrito`)
    }
  }
})

/**
 * RecordDocumentInterface define la estructura de un documento de registro médico en la base de datos, incluyendo campos como el ID del paciente, el ID del doctor, el tipo de registro (ambulatorio u hospitalario), las fechas de inicio y fin, la razón de la consulta u hospitalización, el diagnóstico, los medicamentos prescritos, el estado del registro (abierto o cerrado) y el precio total de los medicamentos prescritos.
 */
export interface RecordDocumentInterface extends Document {
  pacientId: PatientDocumentInterface,
  doctorId: StaffDocumentInterface,
  type: 'Ambulatoria' | 'Hospitalaria',
  startDate: Date,
  endDate?: Date,
  reason: string,
  diagnostic: string,
  medications?: MedicationPrescription[],
  status: 'abierto' | 'cerrado'
  totalPrice: number
}

/**
 * RecordSchema define la estructura del documento de registro médico en la base de datos, incluyendo validaciones para cada campo, como la validación de que el ID del paciente y del doctor existan en la base de datos, la restricción de los valores permitidos para el tipo de registro y el estado del registro, y validaciones para asegurar que el precio total de los medicamentos prescritos no sea negativo.
 */
const RecordSchema = new Schema<RecordDocumentInterface>({
  pacientId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Patient'
  },
  doctorId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Staff'
  },
  type: {
    type: String,
    required: true,
    enum: ['Ambulatoria', 'Hospitalaria']
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: false
  },
  reason: {
    type: String,
    required: true,
    validate: (value: string) => {
      if (value === '') throw new Error(`Debe existir una razón para la consulta u hospitalización`)
    }
  },
  diagnostic: {
    type: String,
    required: true,
    validate: (value: string) => {
      if (value === '') throw new Error(`Debe existir una razón para la consulta u hospitalización`)
    }
  },
  medications: {
    type: [Map],
    required: false,
    of: MedicationPrescriptionSchema
  },
  status: {
    type: String,
    required: true,
    enum: ['abierto', 'cerrado']
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  }
})

/**
 * Record es el modelo de Mongoose para la entidad registro médico, basado en el esquema RecordSchema y la interfaz RecordDocumentInterface, que se utiliza para interactuar con la colección de registros médicos en la base de datos, permitiendo realizar operaciones como crear, leer, actualizar y eliminar documentos de registro médico.
 */
export const Record = model<RecordDocumentInterface>('Record', RecordSchema);