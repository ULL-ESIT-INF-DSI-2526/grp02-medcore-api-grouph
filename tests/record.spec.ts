import { describe, test, beforeEach, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { Record } from '../src/models/record.js'
import { Staff } from '../src/models/staff.js';
import { Patient } from '../src/models/patient.js';
import { MedicationPrescription } from '../src/models/record.js';
import { MedicationDocumentInterface } from '../src/models/medication.js';
import { Medication } from '../src/models/medication.js';
import { ObjectId, Schema } from 'mongoose';

const firstStaff = {
  name: 'Dr. Juan Pérez',
  medicalNumber: 12349,
  specialty: 'Cardiología',
  professionalCategory: 'Medic',
  shift: 'Mañana',
  consultNumber: 5,
  yearsExperience: 10,
  contactInfo: {
    email: 'drjuan@gmail.com',
    phoneNumber: 123456789,
    direction: 'Calle Falsa 123'
  },
  status: 'Activo'
}

const firstPatient = {
    name: "John Doe",
    birthDate: "1990-01-01",
    identificationNumber: "12345679A",
    socialSecurityNumber: "987654329",
    gender: "Masculino",
    contactInformation: {
        email: "johndoe@gmail.com",
        phone: 673543112,
        address: "calle san bernardo 12"
    },
    knownAllergies: ["Penicillin"],
    bloodType: "O+",
    status: "Activo"
};

const firstMed = {
  comercialName: "Epinefrina",
  DCIName: "Epinefrutus Maximus",
  nationalCode: "E109",
  pharmaceuticalForm: "Solución Inyectable",
  dose: { quantity: 50, unit: "ml"},
  administrationRoute: "Intramuscular",
  stock: 10000,
  price: 20.50,
  prescription: true,
  expireDate: new Date("2028-02-02"),
  contraindications: ["No usar si ha tomado alcohol", "No usar si es un bebé"]
}



beforeEach(async () => {
  await Record.deleteMany({});
  await Patient.deleteMany({});
  await Staff.deleteMany({});
  await Medication.deleteMany({});
  await new Patient(firstPatient).save();
  await new Staff(firstStaff).save();
  await new Medication(firstMed).save();

  const pacient_ = (await Patient.findOne({identificationNumber: firstPatient.identificationNumber}));
  const doctor_ = (await Staff.findOne({medicalNumber: firstStaff.medicalNumber}));
  
  let pacientId;
  let doctorId;

  if(pacient_ && doctor_) {
    pacientId = pacient_._id;
    doctorId = doctor_._id;
  }
  const firstRecord = {
    pacientId: pacientId,
    doctorId: doctorId,
    type: 'Ambulatoria',
    startDate: '2026-05-08T20:46:37.740Z',
    reason: 'Dolores insoportables',
    diagnostic: 'Tiene Hernia',
    status: 'abierto',
    totalPrice: 61.5,
  };

  await new Record(firstRecord).save(); 
});

describe("GET /records", () => {
  test("Should succesfully return a record", async () => {
    await request(app)
      .get('/records?startDate="2026-01-01"&endDate="2030-01-01"')
      .expect(200)
  })

  test("Should succesfully return a record", async () => {
    await request(app)
      .get('/records?startDate="2026-01-01"&endDate="2030-01-01"&type=Ambulatoria')
      .expect(200)
  })

  test("Should not return a record", async () => {
    await request(app)
      .get('/records?startDate="2026-01-01"&endDate="2030-01-01"&type=Hospitalaria')
      .expect(404)
  })

  test("Should succesfully return a record", async () => {
    await request(app)
      .get('/records/patient?identificationNumber=12345679A') 
      .expect(200)
  })

  test("Should not return a record", async () => {
    await request(app)
      .get('/records/patient?identificationNumber=123456789A')
      .expect(404)
  })

  test("Should succesfully return a record by id", async () => {  // -------
    const record = await request(app)
      .get('/records/patient?identificationNumber=12345679A')
      .expect(200)

    await request(app)
      .get(`/records/${record._body[0]._id}`)
      .expect(200)
  })
});

describe('POST /records', () => {
  test('should create a new record', async () => {
    const firstMedication = await Medication.findOne({comercialName: "Epinefrina"})
    if (!firstMedication) {
      throw new Error('Medication not found');
    }
    const firstPrescription = {
      medicationId: firstMedication._id,
      dose: {quantity: 50, unit: firstMedication.dose.unit},
      posology: 'Cada 8 horitas'
    }

    const secondPrescription = {
      medicationId: firstMedication._id,
      dose: {quantity: 100, unit: firstMedication.dose.unit},
      posology: 'Solo si sube la fiebre'
    }
    const record = await request(app).post('/records').send(
      {
        identificationNumber: firstPatient.identificationNumber,
        medicalNumber: firstStaff.medicalNumber,
        type: 'Ambulatoria',
        startDate: new Date(),
        reason: 'Dolores insoportables',
        diagnostic: 'Tiene Hernia',
        medications: [firstPrescription, secondPrescription],
        status: 'abierto'
      }
    ).expect(201)
  })

})