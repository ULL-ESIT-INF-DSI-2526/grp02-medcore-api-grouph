import { Document, Schema, model, ObjectId } from 'mongoose'
import { Dose } from '../interfaces/Dose.js'
import { Patient, PatientDocumentInterface } from './patient.js'
import { Staff, StaffDocumentInterface } from './staff.js'
import { Medication, MedicationDocumentInterface } from './medication.js'


export interface MedicationPrescription {
  medicationId: MedicationDocumentInterface,
  dose :Dose,
  posology: string,
}

const MedicationPrescriptionSchema = new Schema<MedicationPrescription>({
  medicationId: {
    type: Schema.Types.ObjectId,
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

export const Record = model<RecordDocumentInterface>('Record', RecordSchema);