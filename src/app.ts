import express from 'express';
import './db/mongoose.js';
import { defaultRouter } from './routers/default.js';
import { medicationRouter } from './routers/medication.js';
import { staffRouter } from './routers/staff.js';
import { patientRouter } from './routers/patient.js';

export const app = express();
app.use(express.json());
app.use(medicationRouter);
app.use(staffRouter);
app.use(patientRouter);
app.use(defaultRouter);