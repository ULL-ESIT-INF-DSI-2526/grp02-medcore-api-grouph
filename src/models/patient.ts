import {Document, model, Schema} from 'mongoose';
import validator from 'validator';

export interface PatientDocumentInterface extends Document {
  name: string;
  birthDate: Date;
  identificationNumber: string;
  socialSecurityNumber: string;
  gender: 'Masculino' | 'Femenino' | 'Otro';
  contactInformation: {
    phone: string;
    email: string;
    address: string;
  };
  knownAllergies: string[];
  bloodType:  'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  status: 'Activo' | 'Baja temporal' | 'Fallecido';
}

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
    enum: ['Masculino', 'Femenino']
  },

  contactInformation:{
    phone: {
      type: String, 
      required: true, 
      trim: true,
      validate(value: number){
        if (validator.isMobilePhone(value.toString(), 'es-ES')) {
          throw new Error('El número de teléfono no es válido');
        }
      }
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

export const Patient = model<PatientDocumentInterface>('Patient', PatientSchema);