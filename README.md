# Example of REST API: MedCore

## Introducción
Esto es una API REST destinada a gestionar el sistema de información de un hospital. Se pueden realizar operaciones CRUD para Pacientes, Personal, Medicamentos y Registros.

## API Desplegada
La API está desplegada en Render y conectada a una base de datos en MongoDB Atlas:

URL base: [MedCoreAPI](https://medcore-api-grouph.onrender.com)

> Cabe destacar que el servicio está alojado con el plan gratuito de Render. Si lleva un timepo inactivo la primera petición puede tardar en torno a un minuto en responder mientras el servidor se activa.

## Endpoints disponibles

### Documentación
Puede acceder a la docomentacion interactiva a través del enlace: [MedCoreAPIDocumentation](https://medcore-api-grouph.onrender.com/api-docs)

| Método | Ruta       | Descripción |
| ------ | ---------- | ----------- |
| GET    | /api-docs  | Swagger UI |

> Cualquier ruta no contemplada devuelve **501** (router por defecto).

---

### Patients
| Método | Ruta          | Query / Params | Descripción |
| ------ | ------------- | -------------- | ----------- |
| POST   | /patients     | —              | Crear paciente |
| GET    | /patients     | `name?`, `identificationNumber?` | Listar/buscar pacientes |
| GET    | /patients/:id | `:id`          | Obtener paciente por ID |
| PATCH  | /patients     | `name?`, `identificationNumber?` | Actualizar 1 paciente por filtro (contactInformation/knownAllergies/status) |
| PATCH  | /patients/:id | `:id`          | Actualizar paciente por ID (contactInformation/knownAllergies/status) |
| DELETE | /patients/    | `identificationNumber` (obligatorio) | Eliminar por identificación y borrar sus records |
| DELETE | /patients/:id | `:id`          | Eliminar por ID y borrar sus records |

---

### Staff
| Método | Ruta        | Query / Params | Descripción |
| ------ | ----------- | -------------- | ----------- |
| POST   | /staff      | —              | Crear staff |
| GET    | /staff/:id  | `:id`          | Obtener staff por ID |
| GET    | /staff/     | `name?`, `specialty?` | Listar/buscar staff |
| PATCH  | /staff/:id  | `:id`          | Actualizar staff por ID (campos permitidos según router) |
| PATCH  | /staff/     | `name?`, `specialty?` | Actualizar 1 staff por filtro |
| DELETE | /staff/:id  | `:id`          | Eliminar staff por ID |
| DELETE | /staff/     | `name?`, `specialty?` | Eliminar staff por filtro (varios) |

---

### Medication
| Método | Ruta            | Query / Params | Descripción |
| ------ | --------------- | -------------- | ----------- |
| POST   | /medication     | —              | Crear medicamento |
| GET    | /medication     | `comercialName?`, `DCIName?`, `nationalCode?` | Listar/buscar medicamentos |
| GET    | /medication/:id | `:id`          | Obtener medicamento por ID |
| PATCH  | /medication     | `comercialName?`, `DCIName?`, `nationalCode?` | Actualizar 1 medicamento por filtro (stock/price/expireDate) |
| PATCH  | /medication/:id | `:id`          | Actualizar medicamento por ID (stock/price/expireDate) |
| DELETE | /medication     | `comercialName?`, `DCIName?`, `nationalCode?` | Eliminar medicamentos por filtro |
| DELETE | /medication/:id | `:id`          | Eliminar medicamento por ID |

---

### Records
| Método | Ruta             | Query / Params | Descripción |
| ------ | ---------------- | -------------- | ----------- |
| POST   | /records         | —              | Crear record (requiere `identificationNumber` y `medicalNumber` en body) |
| GET    | /records         | `startDate` (oblig.), `endDate` (oblig.), `type?` | Listar records por rango de fechas (y tipo opcional) |
| GET    | /records/patient | `identificationNumber` (oblig.) | Listar records de un paciente |
| GET    | /records/:id     | `:id`          | Obtener record por ID |
| PATCH  | /records/:id     | `:id`          | Actualizar record (type/endDate/reason/diagnostic/medications/status/totalPrice) |
| DELETE | /records/:id     | `:id`          | Eliminar record por ID |

## Setup

**Requisitos:**
- Node.js
- MongoDB

**Instalación**
```bash
npm install
```
**Ejecución en local**
```bash
npm run build
npm start
```
> Por defecto se utilizan las siguientes variables de entorno:
> - PORT: *3000*
> - MONGODB_URL: *'mongodb://127.0.0.1:27017/hospital'*

No obstante puede crear su propio fichero .env en la raíz del proyecto siguiendo este esquema:

```md
PORT=3000
MONGODB_URL=mongodb+srv://admin:<db-password>@grupoh.vuh6qu4.mongodb.net/hospital
```

**Ejecutar test**
```bash
npm run test
```

> Los test toman sus variables de entorno de los ficheros `/config/test.env` ya que se ejecutan en una base de datos diferente para evitar conflictos.


## Consideraciones especiales
Se han tomado las siguientes decisiones para gestionar los casos especiales que pudieran suceder.

### Patients
> **Consideración especial:** *al borrar un paciente del sistema, deberá decidir qué ocurre con sus registros de consultas e ingresos asociados. Justifique su decisión en la documentación.*

Al borrar los pacientes de la base de datos, se borran también sus registros. Ya que entendemos que si se borran es porque no se necesitan o por razones de peso. Por ejemplo, un paciente fallecido hace 20 años, del cual no se necesitan sus registros para estudios ni nada.

### Staff
> **Consideración especial:** *si un miembro del personal médico se elimina del sistema, ¿qué ocurre con las consultas e ingresos en los que figuraba como responsable? Justifique su decisión.*

En este caso, no borramos los registros. Porque si borramos los registros porque el staff ha dejado de trabajar en el hospital o cualquier otra razón, perderíamos los registros de sus pacientes que pueden estar siendo tratados en ese momento.

### Medication
> **Consideración especial:** *antes de borrar un medicamento del catálogo, ¿qué debería comprobarse en relación a los registros de consultas que lo referencian?*

Comprobar que antes de borrar la medicación, no se le está suministrando a ningún paciente en ese momento. Ya que se entiende, que dicho paciente la necesita.

## Autores
- Daniel Díaz
- Eduardo Socas
- Francisco Fdez