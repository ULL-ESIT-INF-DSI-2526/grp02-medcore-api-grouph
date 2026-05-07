import { describe, test, beforeEach, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { Staff } from '../src/models/staff.js'

const firstStaff = {
  name: 'Dr. Juan Pérez',
  medicalNumber: 12345,
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

beforeEach(async () => {
  await Staff.deleteMany()
  await new Staff(firstStaff).save();
})

describe('POST /staff', () => {
  test('Should succesfully create a new staff member', async () => {
    const luisa = {
        name: 'Dra. María Gómez',
        medicalNumber: 54321,
        specialty: 'Pediatría',
        professionalCategory: 'Medic',
        shift: 'Tarde',
        consultNumber: 3,
        yearsExperience: 5,
        contactInfo: {
          email: 'drmaria@gmail.com',
          phoneNumber: 987654321,
          direction: 'Avenida Gigante 456'
        },
        status: 'Activo'
      }
    
    const res = await request(app)
      .post('/staff')
      .send(luisa)
      .expect(201)

    expect((res.body)).toMatchObject(luisa)
  })
  test('Should not create a staff member with missing fields', async () => {
    await request(app)
      .post('/staff')
      .send({
        name: 'Dra. María Gómez',
        medicalNumber: 54321,
        specialty: 'Pediatría',
        professionalCategory: 'Medic',
        shift: 'Tarde',
        consultNumber: 3,
        yearsExperience: 5,
        contactInfo: {
          email: ''
        },
        status: 'Activo'
      })
      .expect(500)
  })
  test('Should not create a staff member with invalid fields', async () => {
    await request(app)
      .post('/staff')
      .send({
        name: 'Dra. María Gómez',
        medicalNumber: -54321,
        specialty: 'Pediatría',
        professionalCategory: 'Medic',
        shift: 'Tarde',
        consultNumber: 3,
        yearsExperience: 5,
        contactInfo: {
          email: ''
        },
        status: 'Activo'
      })
      .expect(500)
  })
})

describe('GET /staff', () => {
  test('Should succesfully get a staff member by name', async () => {
    await request(app)
      .get('/staff?name=Dr. Juan Pérez')
      .expect(200);
  })
  test('Should succesfully get a staff member by specialty', async () => {
    await request(app)
      .get('/staff?specialty=Cardiología')
      .expect(200);
  })
  test('Should return 400 if query is not allowed', async () => {
    await request(app)
      .get('/staff?age=30')
      .expect(400);
  })
  test('Should return 404 if no staff member found', async () => {
    await request(app)
      .get('/staff?name=Dr. No Existe')
      .expect(404);
  })
})

describe('GET /staff/:id', () => {
  test('Should succesfully get a staff member by id', async () => {
    const staff = await request(app).get('/staff?name=Dr. Juan Pérez').expect(200);
  })
  test('Should return 404 if staff member not found', async () => {
    await request(app).get('/staff/64b8f0c2f0c2f0c2f0c2f0c2').expect(404);
  })
})

describe('PATCH /staff/:id', () => {
  test('Should succesfully update a staff member', async () => {
    const staff = await request(app).get('/staff?name=Dr. Juan Pérez').expect(200);
    await request(app)
      .patch(`/staff/${staff._body[0]._id}`)
      .send({
        shift: 'Noche',
        yearsExperience: 12
      })
      .expect(200);
  })
  test('Should return 400 if update is not allowed', async () => {
    const staff = await request(app).get('/staff?name=Dr. Juan Pérez').expect(200);
    await request(app)
      .patch(`/staff/${staff._body[0]._id}`)
      .send({
        name: 'Dr. Juan Pérez Modificado'
      })
      .expect(412);
  })
  test('Should return 404 if staff member not found', async () => {
    await request(app)
      .patch('/staff/64b8f0c2f0c2f0c2f0c2f0c2')
      .send({
        shift: 'Noche',
        yearsExperience: 12
      })
      .expect(404);
  })
})

describe('PATCH /staff', () => {
  test('Should return 400 if query is not allowed', async () => {
    await request(app)      .patch('/staff?age=30')
      .send({
        shift: 'Noche',
        yearsExperience: 12
      })
      .expect(400);
  })
  test('Should return 404 if no staff member found', async () => {
    await request(app)
      .patch('/staff?name=Dr. No Existe')
      .send({
        shift: 'Noche',
        yearsExperience: 12
      })
      .expect(404); 
  })
  test('Should succesfully update a staff member', async () => {
    await request(app)
      .patch('/staff?name=Dr. Juan Pérez')
      .send({
        shift: 'Noche',
        yearsExperience: 12
      })
      .expect(200);
  })
})

describe('DELETE /staff/:id', () => {
  test('Should succesfully delete a staff member', async () => {
    const staff = await request(app).get('/staff?name=Dr. Juan Pérez').expect(200);
    await request(app)
      .delete(`/staff/${staff._body[0]._id}`)
      .expect(200);

  })
  test('Should return 404 if staff member not found', async () => {
    await request(app)
      .delete('/staff/64b8f0c2f0c2f0c2f0c2f0c2')
      .expect(404);
  })
})

describe('DELETE /staff', () => {
  test('Should succesfully delete a staff member', async () => {
    await request(app)
      .delete('/staff?name=Dr. Juan Pérez')
      .expect(200);
  })
  test('Should return 404 if no staff member found', async () => {
    await request(app)
      .delete('/staff?name=Dr. No Existe')
      .expect(404);
  })
  test('Should return 400 if query is not allowed', async () => {
    await request(app)
      .delete('/staff?age=30')
      .expect(400);
  })
})


