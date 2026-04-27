import { Document, Schema, model } from 'mongoose';
import { ContactInfo } from '../interfaces/ContactInfo.js';
import validator from 'validator';
// Falta importar de records

interface StaffDocumentInterface  extends Document {
  name: string,
  medicalNumber: number,
  specialty: 'Medicina General' | 'Cardiología' | 'Traumatología' | 'Pediatría' | 'Oncología' | 'Urgencias',
  professionalCategory: 'Medic' | 'Resident' | 'Nurse' | 'Nurse Auxiliar' | 'Head of Service',
  shift: 'Mañana' | 'Tarde' | 'Noche' | 'Rotatorio',
  consultNumber: number,
  yearsExperience: number,
  contactInfo: ContactInfo,
  status: 'Activo' | 'Inactivo',
  //record: RecordDocumentInterface,
}

const StaffSchema = new Schema<StaffDocumentInterface>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  medicalNumber: {
    type: Number,
    required: true,
    unique: true,
    validate(value: number) {
      if (value < 0) {
        throw new Error('El número de consulta no puede ser negativo')
      }
    }
  },
  specialty: {
    type: String,
    required: true,
    enum: ['Medicina General', 'Cardiología', 'Traumatología', 'Pediatría', 'Oncología', 'Urgencias'],
  },
  professionalCategory: {
    type: String,
    required: true,
    enum: ['Medic' , 'Resident', 'Nurse', 'Nurse Auxiliar', 'Head of Service']
  },
  shift: {
    type: String,
    required: true,
    enum: ['Mañana', 'Tarde', 'Noche', 'Rotatorio']
  },
  consultNumber: {
    type: Number,
    required: true,
    validate(value: number) {
      if (value < 0) {
        throw new Error('El número de consulta no puede ser negativo')
      }
    }
  },
  yearsExperience: {
    type: Number,
    required: true,
    validate(value: number) {
      if (value < 0) {
        throw new Error('El número de consulta no puede ser negativo')
      }
    }
  },
  contactInfo: {
    direction: { 
      type: String,
      required: true,  
    },
    phoneNumber: {
      type: Number,
      required: true,
      validate(value: number) {
        if (value.toString().length != 9) {
          throw new Error('El número de teléfono tiene que ser de 9 dígitos');
        }
      },
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      validate(value: string) {
        if (!validator.default.isEmail(value)) {
          throw new Error('Email is invalid');
        }
      }
    }
  },
  status: {
    type: String,
    required: true,
    enum: ['Activo', 'Inactivo']
  }
  /*record: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  }*/
});

export const Staff = model<StaffDocumentInterface>('Staff', StaffSchema);