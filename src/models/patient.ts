import {Document, model, Schema} from 'mongoose';
import validator from 'validator';

/**
 * Interfaces y Schemas para la entidad Patient
 */
/**
 * PatientDocumentInterface define la estructura de un documento de paciente en la base de datos, incluyendo campos como nombre, fecha de nacimiento, número de identificación, número de seguridad social, género, información de contacto, alergias conocidas, tipo de sangre y estado del paciente.
 */
export interface PatientDocumentInterface extends Document {
  name: string;
  birthDate: Date;
  identificationNumber: string;
  socialSecurityNumber: string;
  gender: 'Masculino' | 'Femenino' | 'Otro';
  contactInformation: {
    phone: number;
    email: string;
    address: string;
  };
  knownAllergies: string[];
  bloodType:  'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  status: 'Activo' | 'Baja temporal' | 'Fallecido';
}
/**
 * PatientSchema define la estructura del documento de paciente en la base de datos, incluyendo validaciones para cada campo, como la validación de que la fecha de nacimiento no sea futura, la validación del formato del número de identificación y del correo electrónico, y la restricción de los valores permitidos para el género, el tipo de sangre y el estado del paciente.
 */
const PatientSchema: Schema = new Schema({
  name: {
    type: String,
    required: true, 
    trim: true
  },

  birthDate: {
    type: Date,
    required: true,
    validate(value: Date){
      if (value > new Date()) {
        throw new Error('La fecha de nacimiento no puede ser futura');
      }
    }
  },
  
  identificationNumber: {
    type: String,
    required: true,
    unique: true, 
    trim: true,
    validate: (value:string) => {
      if(validator.isIdentityCard(value, 'ES')) {
        throw new Error('El número de identificación no es válido');
      }
    }
  },

  socialSecurityNumber: {
    type: String, 
    required: true, 
    unique: true, 
    trim: true
  },

  gender: {
    type: String, 
    required: true, 
    enum: ['Masculino', 'Femenino', 'Otro']
  },

  contactInformation:{
    phone: {
      type: Number, 
      required: true, 
      trim: true,
    },
    email: {
      type: String, 
      required: true, 
      trim: true,
      lowercase: true,
      validate(value: string){
        if (!validator.isEmail(value)) {
          throw new Error('El correo electrónico no es válido');  
        }
      }
    },
    address: {
      type: String, 
      required: true, 
      trim: true
    }
  },

  knownAllergies: {
    type: [String], 
    required: true,
    default: []
  },

  bloodType: {
    type: String, 
    required: true, 
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },

  status: {
    type: String, 
    required: true, 
    enum: ['Activo', 'Baja temporal', 'Fallecido']
  }
});

/**
 * Patient es el modelo de Mongoose para la entidad paciente, basado en el esquema PatientSchema y la interfaz PatientDocumentInterface, que se utiliza para interactuar con la colección de pacientes en la base de datos, permitiendo realizar operaciones como crear, leer, actualizar y eliminar documentos de paciente.
 */
export const Patient = model<PatientDocumentInterface>('Patient', PatientSchema);