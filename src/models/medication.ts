import { Document, Schema, model } from 'mongoose';
import { Dose } from '../interfaces/Dose.js';

export interface MedicationDocumentInterface extends Document {
  comercialName: string,
  DCIName: string,
  nationalCode: string,
  pharmaceuticalForm: 'Comprimido' | 'Cápsula' | 'Solución Oral' | 'Solución Inyectable' | 'Pomada' | 'Parche' | 'Transdérmico' | 'Inhalador' | 'Otras',
  dose: Dose,
  administrationRoute: 'Oral' | 'Intravenosa' | 'Intramuscular' | 'Subcutánea' | 'Tópica' | 'Inhalatoria',
  stock: number,
  price: number,
  prescription: boolean,
  expireDate: Date,
  contraindications: string[]
}

const MedicationSchema = new Schema<MedicationDocumentInterface>({
  comercialName: {
    type: String,
    required: true,
    trim: true,
    validate(value: string) {
      if (value.length < 3) {
        throw new Error("El DCIName del medicamento no cumple la longitud mínima");
      }
    }
  },
  DCIName: {
    type: String,
    required: true,
    trim: true,
    validate(value: string) {
      if (value.length < 3) {
        throw new Error("El DCIName del medicamento no cumple la longitud mínima");
      }
    }
  },
  nationalCode: {
    type: String,
    required: true,
    unique: true,
  },
  pharmaceuticalForm: {
    type: String,
    required: true,
    enum: ['Comprimido', 'Cápsula', 'Solución Oral', 'Solución Inyectable', 'Pomada', 'Parche', 'Transdérmico', 'Inhalador', 'Otras']
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
  administrationRoute: {
    type: String,
    required: true,
    enum: ['Oral', 'Intravenosa', 'Intramuscular', 'Subcutánea', 'Tópica', 'Inhalatoria']
  },
  stock: {
    type: Number,
    required: true,
    validate(value: number) {
      if (value < 0) {
        throw new Error('El stock no puede ser menor que cero')
      }
    }
  },
  price: {
    type: Number,
    required: true,
    validate(value: number) {
      if (value < 0) {
        throw new Error('El precio no puede ser negativo')
      }
    }
  },
  prescription: {
    type: Boolean,
    required: true
  },
  expireDate: {
    type: Date,
    required: true
  },
  contraindications: {
    type: [String],  // Array de strings
    required: true
  }
})

export const Medication = model<MedicationDocumentInterface>('Medication', MedicationSchema);