import { Document, Schema, model } from 'mongoose';
import { Dose } from '../interfaces/Dose.js';

export interface MedicationDocumentInterface extends Document {
  comercialAndDCIName: string,
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
  comercialAndDCIName: {
    type: String,
    required: true,
    trim: true,
    validate(value: string) {
      let names: string[] = value.split(' ');  // Separamos el string en dos, para separar los dos nombres
      if (names[0].length < 5 && names[1].length < 5) {
        throw new Error('Los nombres del fármaco deben de tener como mínimo, 6 letras');
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