import { describe, test, beforeEach, expect } from 'vitest';
import request from "supertest";
import { app } from '../src/app.js';
import { Medication } from '../src/models/medication.js';

const firstMed = {
  comercialName: "Epinefrina",
  DCIName: "Epinefrutus Maximus",
  nationalCode: "E101",
  pharmaceuticalForm: "Solución Inyectable",
  dose: { quantity: 50, unit: "ml"},
  administrationRoute: "Intramuscular",
  stock: 100,
  price: 20.50,
  prescription: true,
  expireDate: "2028-02-02",
  contraindications: ["No usar si ha tomado alcohol", "No usar si es un bebé"]
}

beforeEach(async () => {
  await Medication.deleteMany();
  await new Medication(firstMed).save();
});

describe("POST /medication", () => {
  test("Should succesfully create a new medication", async () => {
    await request(app)
      .post("/medication")
      .send({
        comercialName: "Adventan",
        DCIName: "Alivius Maximus",
        nationalCode: "E102",
        pharmaceuticalForm: "Pomada",
        dose: { quantity: 50, unit: "ml"},
        administrationRoute: "Tópica",
        stock: 100,
        price: 20.50,
        prescription: true,
        expireDate: "2028-02-02",
        contraindications: ["No usar si ha tomado alcohol", "No usar si es un bebé"]
      })
      .expect(201)
  })

  test("Should not create a new medication", async () => {
    await request(app)
      .post("/medication")
      .send({
        comercialName: "Adventan",
        DCIName: "Alivius Maximus",
        nationalCode: "E102",
        pharmaceuticalForm: "Pomada",
        dose: { quantity: 50, unit: "ml"},
        administrationRoute: "En la piel",
        stock: 100,
        price: 20.50,
        prescription: true,
        expireDate: "2028-02-02",
        contraindications: ["No usar si ha tomado alcohol", "No usar si es un bebé"]
      })
      .expect(500)
  })
})

describe("GET /medication", () => {
  test("Should succesfully get a medication", async () => {
    await request(app)
      .get('/medication?comercialName=Epinefrina&DCIName=Epinefrutus%20Maximus&nationalCode=E101')
      .expect(200);
  })
  test("Should succesfully get a medication", async () => {
    await request(app)
      .get('/medication?nationalCode=E101')
      .expect(200);
  })
  test("Should succesfully get a medication", async () => {
    await request(app)
      .get('/medication?comercialName=Epinefrina')
      .expect(200);
  })
  test("Should succesfully get a medication", async () => {
    await request(app)
      .get('/medication?DCIName=Epinefrutus%20Maximus')
      .expect(200);
  })
  test("Should succesfully get all medication", async () => {
    await request(app)
      .get('/medication')
      .expect(200);
  })
})

describe("GET /medication/:id", () => {
  test("Should succesfully get a medication", async () => {
    const med = await request(app)
                .get('/medication?comercialName=Epinefrina')
      
    await request(app)
    //@ts-ignore
      .get(`/medication/${med._body[0]._id}`)
      .expect(200)
  })
})

describe("DELETE /medication", () => {
  test("Should succesfully delete a medication", async () => {
    await request(app)
      .delete('/medication?comercialName=Epinefrina&DCIName=Epinefrutus%20Maximus&nationalCode=E102')
      .expect(200);
  })
  test("Should succesfully delete a medication", async () => {
    await request(app)
      .delete('/medication?nationalCode=E102')
      .expect(200);
  })
  test("Should succesfully delete a medication", async () => {
    await request(app)
      .delete('/medication?comercialName=Epinefrina')
      .expect(200);
  })
  test("Should succesfully delete a medication", async () => {
    await request(app)
      .delete('/medication?DCIName=Epinefrutus%20Maximus')
      .expect(200);
  })
})

describe("DELETE /medication/:id", () => {
  test("Should succesfully delete a medication", async () => {
    const med = await request(app)
                .get('/medication?comercialName=Epinefrina')
      
    await request(app)
      //@ts-ignore
      .delete(`/medication/${med._body[0]._id}`)
      .expect(200)
  })
})

describe("PATCH /medication", () => {
  test("Should succesfully update a medication", async () => {
    await request(app)
      .patch('/medication?comercialName=Epinefrina&DCIName=Epinefrutus%20Maximus&nationalCode=E101')
      .send({
        stock: 99
      })
      .expect(200);
  })
  test("Should succesfully update a medication", async () => {
    await request(app)
      .patch('/medication?nationalCode=E101')
      .send({
        stock: 99
      })
      .expect(200);
  })
  test("Should succesfully update a medication", async () => {
    await request(app)
      .patch('/medication?comercialName=Epinefrina')
      .send({
        stock: 99
      })
      .expect(200);
  })
  test("Should succesfully update a medication", async () => {
    await request(app)
      .patch('/medication?DCIName=Epinefrutus%20Maximus')
      .send({
        stock: 99
      })
      .expect(200);
  })
  test("Should not update a medication", async () => {
    await request(app)
      .patch('/medication?DCIName=Epinefrutus%20Maximus')
      .send({
        DCIName: 'Anakyn Skywalker'
      })
      .expect(400);
  })
})

describe("PATCH /medication/:id", () => {
  test("Should succesfully update a medication", async () => {
    const med = await request(app)
                .get('/medication?comercialName=Epinefrina')
    
    await request(app)
    //@ts-ignore
      .patch(`/medication/${med._body[0]._id}`)
      .send({
        stock: 99
      })
      .expect(200)
  })
})