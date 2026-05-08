import { describe, test, beforeEach, expect } from 'vitest';
import request from "supertest";
import { app } from '../src/app.js';
import {Patient} from '../src/models/patient.js';

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

beforeEach(async () => {
    await Patient.deleteMany();
    await new Patient(firstPatient).save();
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

