import express from 'express';
import './db/mongoose.js';
import { recordRouter } from './routers/record.js';
import { defaultRouter } from './routers/default.js';
import { medicationRouter } from './routers/medication.js';
import { staffRouter } from './routers/staff.js';
import { patientRouter } from './routers/patient.js';
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc, {Options} from 'swagger-jsdoc';
import { swaggerSpec } from './config/swagger.js';

export const app = express();
app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * Rutas de la API
 * Cada router maneja un conjunto de rutas relacionadas con una entidad específica (medicamentos, personal, pacientes, registros médicos).
 * El router por defecto maneja las rutas que no coinciden con las anteriores, devolviendo un error 404.
 */
app.use(medicationRouter);
app.use(staffRouter);
app.use(patientRouter);
app.use(recordRouter);
app.use(defaultRouter);