import swaggerJsDoc, { Options } from 'swagger-jsdoc';
import { Medication } from '../models/medication.js';

export const swaggerOptions: Options = {
  definition: {
    openapi: '3.0.0', 
    info: {
      title: 'MedCore API',
      version: '1.0.0',
      description: 'API REST para la gestion del sistema de información del Hospital Universitario de la Costa'
    },
    servers: [
      {
        url: process.env.SWAGGER_SERVER
      },
    ],
    components:{
      schemas: {
        Patient: {
          type: 'object',
          required: ['name', 'birthDate', 'identificationNumber', 'socialSecurityNumber', 'gender', 'contactInformation', 'knownAllergies', 'bloodType', 'status'],
          properties: {
            _id: {
              type: 'string',
              description: "ID único del paciente (generado automáticamente por MongoDB)",
              example: "60c72b2f9b1d8e5a5c8f9b1a"
            },
            name: {
              type: 'string',
              description: 'Nombre completo del paciente',
              example: 'Juan Pérez'
            },
            birthDate: {
              type: 'string',
              format: 'date',
              description: 'Fecha de nacimiento del paciente',
              example: '1980-05-15'
            },
            identificationNumber: {
              type: 'string',
              description: 'Número de identificación del paciente (DNI, pasaporte, etc.)',
              example: '12345678A'
            },
            socialSecurityNumber: {
              type: 'string',
              description: 'Número de seguridad social del paciente',
              example: '9876543210'
            },
            gender: {
              type: 'string',
              description: 'Género del paciente',
              example: 'Masculino'
            },
            contactInformation: {
              type: 'object',
              description: 'Información de contacto del paciente',
              properties: {
                phone: {
                  type: 'string',
                  description: 'Número de teléfono del paciente',
                  example: '612345678'
                },
                email: {
                  type: 'string',
                  description: 'Correo electrónico del paciente',
                  example: 'juan.perez@example.com'
                }
              }
            },
            knownAllergies: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Lista de alergias conocidas del paciente',
              example: ['Penicilina', 'Mariscos']
            },
            bloodType: {
              type: 'string',
              description: 'Tipo de sangre del paciente',
              example: 'O+'
            },
            status: {
              type: 'string',
              description: 'Estado del paciente',
              example: 'Activo'
            }
          }
        },
        Medication: {
          type: 'object',
          required: ['comercialName', 'DCIName', 'nationalCode', 'pharmaceuticalForm', 'dose', 'administrationRoute', 'stock', 'price', 'prescription', 'expireDate', 'contraindications'],
          properties: {
            _id: {
              type: 'string',
              description: "ID único del medicamento (generado automáticamente por MongoDB)",
              example: "60c72b2f9b1d8e5a5c8f9b1a"
            },
            comercialName: {
              type: 'string',
              description: 'Nombre comercial del medicamento',
              example: 'Paracetamol'
            },
            DCIName: {
              type: 'string',
              description: 'Denominación Común Internacional del medicamento',
              example: 'Paracetamol'
            },
            nationalCode: {
              type: 'string',
              description: 'Código nacional del medicamento',
              example: '123456'
            },
            pharmaceuticalForm: {
              type: 'string',
              description: 'Forma farmacéutica del medicamento',
              example: 'Comprimido'
            },
            dose: {
              type: 'object',
              description: 'Dosis del medicamento',
              properties: {
                quantity: {
                  type: 'number',
                  description: 'Cantidad de la dosis',
                  example: 500
                },
                unit: {
                  type: 'string',
                  description: 'Unidad de la dosis',
                  example: 'mg'
                }
              }
            },
            administrationRoute: {
              type: 'string',
              description: 'Vía de administración del medicamento',
              example: 'Oral'
            },
            stock: {
              type: 'number',
              description: 'Cantidad de unidades disponibles en stock',
              example: 100
            },
            price: {
              type: 'number',
              description: 'Precio unitario del medicamento',
              example: 5.99
            },
            prescription: {
              type: 'boolean',
              description: 'Indica si el medicamento requiere receta médica',
              example: true
            },
            expireDate: {
              type: 'string',
              format: 'date',
              description: 'Fecha de caducidad del medicamento',
              example: '2023-12-31'
            },
            contraindications: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Lista de contraindicaciones del medicamento',
              example: ['Hipersensibilidad al paracetamol', 'Insuficiencia hepática grave']
            }
          }
        },
        Staff: {
          type: 'object',
          required: ['name', 'medicalNumber', 'specialty', 'professionalCategory', 'shift', 'consultNumber', 'yearsExperience', 'contactInfo', 'status'],
          properties: {
            _id: {
              type: 'string',
              description: "ID único del personal (generado automáticamente por MongoDB)",
              example: "60c72b2f9b1d8e5a5c8f9b1a"
            },
            name: {
              type: 'string',
              description: 'Nombre completo del personal',
              example: 'Dr. Juan Pérez'
            },
            medicalNumber: {
              type: 'number',
              description: 'Número de colegiado del personal',
              example: 12345
            },
            specialty: {
              type: 'string',
              description: 'Especialidad médica del personal',
              example: 'Cardiología'
            },
            professionalCategory: {
              type: 'string',
              description: 'Categoría profesional del personal',
              example: 'Medic'
            },
            shift: {
              type: 'string',
              description: 'Turno de trabajo del personal',
              example: 'Mañana'
            },
            consultNumber: {
              type: 'number',
              description: 'Número de consulta asignado al personal',
              example: 101
            },
            yearsExperience: {
              type: 'number',
              description: 'Años de experiencia del personal',
              example: 10
            },
            contactInfo: {
              type: 'object',
              description: 'Información de contacto del personal',
              properties: {
                phone: {
                  type: 'string',
                  description: 'Número de teléfono del personal',
                  example: '612345678'
                },
                email: {
                  type: 'string',
                  description: 'Correo electrónico del personal',
                  example: 'juan.perez@hospital.com'
                }
              }
            },
            status: {
              type: 'string',
              description: 'Estado del personal',
              example: 'Activo'
            } 
          }
        },
        Record: {
          type: 'object',
          required: ['pacientId', 'doctorId', 'type', 'startDate', 'reason', 'diagnostic', 'status', 'totalPrice'],
          properties: {
            _id: {
              type: 'string',
              description: "ID único del registro médico (generado automáticamente por MongoDB)",
              example: "60c72b2f9b1d8e5a5c8f9b1a"
            },
            pacientId: {
              type: 'Schema.Types.ObjectId',
              description: 'ID del paciente asociado al registro médico',
              example: "60c72b2f9b1d8e5a5c8f9b1a"
            },
            doctorId: {
              type: 'Schema.Types.ObjectId',
              description: 'ID del doctor asociado al registro médico',
              example: "60c72b2f9b1d8e5a5c8f9b1a"
            },
            type: {
              type: 'string',
              description: 'Tipo de registro médico',
              example: 'Ambulatoria'
            },
            startDate: {
              type: 'string',
              format: 'date',
              description: 'Fecha de inicio del registro médico',
              example: '2021-06-15'
            },
            endDate: {
              type: 'string',
              format: 'date',
              description: 'Fecha de fin del registro médico (opcional, solo para registros de tipo Hospitalaria)',
              example: '2021-06-20'
            },
            reason: {
              type: 'string',
              description: 'Razón de la consulta u hospitalización',
              example: 'Dolor de cabeza persistente'
            },
            diagnostic: {
              type: 'string',
              description: 'Diagnóstico del paciente',
              example: 'Migraña'
            },
            medications:{
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  medicationId: {
                    type: 'Schema.Types.ObjectId',
                    description: 'ID del medicamento prescrito',
                    example: "60c72b2f9b1d8e5a5c8f9b1a"
                  },
                  dose: {
                    type: 'object',
                    description: 'Dosis prescrita del medicamento',
                    properties: {
                      quantity: {
                        type: 'number',
                        description: 'Cantidad de la dosis prescrita',
                        example: 500
                      },
                      unit: {
                        type: 'string',
                        description: 'Unidad de la dosis prescrita',
                        example: 'mg'
                      }
                    }
                  }
                }
              }
            },
            status: {
              type: 'string',
              description: 'Estado del registro médico',
              example: 'abierto'
            },
            totalPrice: {
              type: 'number',
              description: 'Precio total de las prescripciones de medicamentos asociadas al registro médico',
              example: 29.95
            }
          }
        },
        MedicationPrescription: {
          type: 'object',
          required: ['medicationId', 'dose', 'posology'],
          properties: {
            medicationId: {
              type: 'Schema.Types.ObjectId',
              description: 'ID del medicamento prescrito',
              example: "60c72b2f9b1d8e5a5c8f9b1a"
            },
            dose: {
              type: 'object',
              description: 'Dosis prescrita del medicamento',
              properties: {
                quantity: {
                  type: 'number',
                  description: 'Cantidad de la dosis prescrita',
                  example: 500
                },
                unit: {
                  type: 'string',
                  description: 'Unidad de la dosis prescrita',
                  example: 'mg'
                }
              }
            },
            posology: {
              type: 'string',
              description: 'Posología del medicamento prescrita por el doctor',
              example: 'Tomar un comprimido cada 8 horas durante 5 días'
            }
          }
        },
        Error404: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Mensaje de error',
              example: 'Entrada no encontrada'
            }
          }
        },
        Error500: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Mensaje de error',
              example: 'Error interno del servidor'
            }
          }  
        },
        Error400: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Mensaje de error',
              example: 'Datos de entrada inválidos'
            }
          }
        }  
      }
    }
  },
  apis: ['./src/routers/*.ts', './dist/routers/*.js'],
};

export const swaggerSpec = swaggerJsDoc(swaggerOptions);