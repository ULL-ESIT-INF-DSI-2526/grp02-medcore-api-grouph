import { describe, test, beforeEach, expect } from 'vitest';
import request from "supertest";
import { app } from '../src/app.js';
import { Patient } from '../src/models/patient.js';
import { Record } from '../src/models/record.js';
import { Staff } from '../src/models/staff.js';

const firstPatient = {
    name: "John Doe",
    birthDate: "1990-01-01",
    identificationNumber: "12345678A",
    socialSecurityNumber: "987654321",
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

const firstRecord = {
  type: 'Ambulatoria',
  startDate: new Date('2026-01-01'),
  reason: 'Dolor torácico',
  diagnostic: 'Seguimiento clínico',
  status: 'abierto',
  totalPrice: 25
};

beforeEach(async () => {
    await Patient.deleteMany({});
    await Record.deleteMany({});
    await Staff.deleteMany({});
    await new Patient(firstPatient).save();
    await new Staff(firstStaff).save();
});

describe("POST /patients", () => {
    test("should successfully create a new patient", async () => {
      await request(app)
        .post("/patients")
        .send({
          name: "Jane Doe",
          birthDate: "1992-02-02",
          identificationNumber: "98765432B",
          socialSecurityNumber: "123456789",
          gender: "Femenino",
          contactInformation: {
            email: "janedoe@gmail.com",
            phone: 673543113,
            address: "calle san bernardo 13"
          },
          knownAllergies: ["Aspirin"],
          bloodType: "A-",
          status: "Activo"
        })
        .expect(201)
    })

    test("should return an error if a patient with the same identification number already exists", async () => {
      await request(app)
        .post("/patients")
        .send({
          name: "John Doe",
          birthDate: "1990-01-01",
          identificationNumber: "12345678A",
          socialSecurityNumber: "987654321",
          gender: "Masculino",
          contactInformation: {
            email: "johndoe@gmail.com",
            phone: 673543112,
            address: "calle san bernardo 12"
          },
          knownAllergies: ["Penicillin"],
          bloodType: "O+",
          status: "Activo"
        })
        .expect(500)
    })
})

describe("GET /patients", () => {
    test("should successfully retrieve all patients", async () => {
      await request(app)
        .get('/patients')
        .expect(200);
    })

    test("Should successfully get a patient", async () => {
      await request(app)
        .get('/patients?name=John%20Doe&identificationNumber=12345678A&socialSecurityNumber=987654321')
        .expect(200);
    })

    test("should successfully retrieve a patient by ID", async () => {
      await request(app)
        .get('/patients?identificationNumber=12345678A')
        .expect(200);
    })

    test("should succesfully retrieve patients by name", async () => {
      await request(app)
        .get('/patients?name=John%20Doe')
        .expect(200);
    });

    test("should succesfully retrieve a patient by Social Security Number", async () => {
      await request(app)
        .get('/patients?socialSecurityNumber=987654321')
        .expect(200);
    });

    test("should return an error if no patient is found with the given criteria", async () => {
      await request(app)
        .get('/patients?name=Nonexistent%20Patient')
        .expect(404);
    });
})

describe("GET /patients/:id", () => {
    test("should successfully retrieve a patient by ID", async () => {
      const patient = await request(app)
      .get('/patients?identificationNumber=12345678A')

      await request(app)
        //@ts-ignore
        .get(`/patients/${patient._body[0]._id}`)
        .expect(200);
    })
  });

  describe("PATCH /patients", () => {
    test("should successfully update a patient's information", async () => {
      await request(app)
        .patch('/patients?identificationNumber=12345678A')
        .send({
          contactInformation: {
            email: 'johndoe2@gmail.com',
            phone: 673543114,
            address: 'calle san bernardo 14'
          },
          knownAllergies: ['Penicillin', 'Aspirin'],
          status: 'Baja temporal'
        })
        .expect(200);
    })

    test("should return an error if no patient is found with the given criteria", async () => {
      await request(app)
        .patch('/patients?identificationNumber=Nonexistent%20Patient')
        .send({
          contactInformation: {
            email: 'johndoe2@gmail.com',
            phone: 673543114,
            address: 'calle san bernardo 14'
          },
          knownAllergies: ['Penicillin', 'Aspirin'],
          status: 'Baja temporal'
        })
        .expect(404);
    })

    test ("should return an error if trying to update a not allowed update type", async () => {
      await request(app)
        .patch('/patients?identificationNumber=12345678A')
        .send({
          name: 'John Doe Updated',
          birthDate: '1990-01-01',
          identificationNumber: '12345678A',
          socialSecurityNumber: '987654321'
        })
        .expect(400);
    })
  })

  describe("PATCH /patients/:id", () => {
    test("should successfully update a patient's information by ID", async () => {
      const patient = await request(app)
      .get('/patients?identificationNumber=12345678A')

      await request(app)
        //@ts-ignore
        .patch(`/patients/${patient._body[0]._id}`)
        .send({
          contactInformation: {
            email: 'johndoe2@gmail.com',
            phone: 673543114,
            address: 'calle san bernardo 14'
          },
          knownAllergies: ['Penicillin', 'Aspirin'],
          status: 'Baja temporal'
        })
        .expect(200);
    })

    test("should return an error if no patient is found with the given ID", async () => {
      await request(app)
        .patch('/patients/60c72b2f9b1d8e5a5c8f9b1d')
        .send({
          contactInformation: {
            email: 'johndoe2@gmail.com',
            phone: 673543114,
            address: 'calle san bernardo 14'
          },
          knownAllergies: ['Penicillin', 'Aspirin'],
          status: 'Baja temporal'
        })
        .expect(404);
    })

    test ("should return an error if trying to update a not allowed update type", async () => {
      const patient = await request(app)
      .patch('/patients?identificationNumber=12345678A')
      .send({
        name: 'John Doe Updated',
        birthDate: '1990-01-01',
        identificationNumber: '123456789A',
        socialSecurityNumber: '987654321'
      })
      .expect(400);
    })
  })

  describe('DELETE /patients', () => {
    test('should delete a patient by identification number and cascade delete its records', async () => {
      const patient = await Patient.findOne({ identificationNumber: firstPatient.identificationNumber });
      const staff = await Staff.findOne({ medicalNumber: firstStaff.medicalNumber });

      if (!patient || !staff) throw new Error('Test fixtures were not created correctly');

      await new Record({
        ...firstRecord,
        pacientId: patient._id,
        doctorId: staff._id,
      }).save();

      await request(app)
        .delete('/patients?identificationNumber=12345678A')
        .expect(200);

      const deletedPatient = await Patient.findById(patient._id);
      const remainingRecords = await Record.find({ pacientId: patient._id });

      expect(deletedPatient).toBeNull();
      expect(remainingRecords).toHaveLength(0);
    });

    test('should delete a patient by id and cascade delete its records', async () => {
      const patient = await Patient.findOne({ identificationNumber: firstPatient.identificationNumber });
      const staff = await Staff.findOne({ medicalNumber: firstStaff.medicalNumber });

      if (!patient || !staff) throw new Error('Test fixtures were not created correctly');

      await new Record({
        ...firstRecord,
        pacientId: patient._id,
        doctorId: staff._id,
      }).save();

      await request(app)
        .delete(`/patients/${patient._id}`)
        .expect(200);

      const deletedPatient = await Patient.findById(patient._id);
      const remainingRecords = await Record.find({ pacientId: patient._id });

      expect(deletedPatient).toBeNull();
      expect(remainingRecords).toHaveLength(0);
    });
  })
  

