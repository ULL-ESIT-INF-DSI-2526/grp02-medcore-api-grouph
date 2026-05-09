import { Document, Schema, model } from 'mongoose';
import { ContactInfo } from '../interfaces/ContactInfo.js';
import validator from 'validator';

/**
 * Interfaces y Schemas para la entidad Staff
 */

/**
 * StaffDocumentInterface define la estructura de un documento de personal médico en la base de datos, incluyendo campos como nombre, número de colegiado, especialidad, categoría profesional, turno, número de consulta, años de experiencia, información de contacto y estado del personal.
 */
export interface StaffDocumentInterface  extends Document {
  name: string,
  medicalNumber: number,
  specialty: 'Medicina General' | 'Cardiología' | 'Traumatología' | 'Pediatría' | 'Oncología' | 'Urgencias',
  professionalCategory: 'Medic' | 'Resident' | 'Nurse' | 'Nurse Auxiliar' | 'Head of Service',
  shift: 'Mañana' | 'Tarde' | 'Noche' | 'Rotatorio',
  consultNumber: number,
  yearsExperience: number,
  contactInfo: ContactInfo,
  status: 'Activo' | 'Inactivo',
}

/**
 * StaffSchema define la estructura del documento de personal médico en la base de datos, incluyendo validaciones para cada campo, como la validación de que el número de colegiado no sea negativo, la restricción de los valores permitidos para la especialidad, categoría profesional, turno y estado del personal, y validaciones para el número de teléfono y el correo electrónico en la información de contacto.
 */
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
});

/**
 * Staff es el modelo de Mongoose para la entidad personal médico, basado en el esquema StaffSchema y la interfaz StaffDocumentInterface, que se utiliza para interactuar con la colección de personal médico en la base de datos, permitiendo realizar operaciones como crear, leer, actualizar y eliminar documentos de personal médico.
 */
export const Staff = model<StaffDocumentInterface>('Staff', StaffSchema);