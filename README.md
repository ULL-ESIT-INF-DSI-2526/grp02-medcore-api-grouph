# Example of REST API

This is an example of a REST API for notes management based on MongoDB, Node.js and Express.


## Consideraciones especiales
### Patients
> **Consideración especial:** *al borrar un paciente del sistema, deberá decidir qué ocurre con sus registros de consultas e ingresos asociados. Justifique su decisión en la documentación.*

Al borrar los pacientes de la base de datos, se borran también sus registros. Ya que entendemos que si se borran es porque no se necesitan o por razones de peso. Por ejemplo, un paciente fallecido hace 20 años, del cual no se necesitan sus registros para estudios ni nada.

### Staff
> **Consideración especial:** *si un miembro del personal médico se elimina del sistema, ¿qué ocurre con las consultas e ingresos en los que figuraba como responsable? Justifique su decisión.*

En este caso, no borramos los registros. Porque si borramos los registros porque el staff ha dejado de trabajar en el hospital o cualquier otra razón, perderíamos los registros de sus pacientes que pueden estar siendo tratados en ese momento.

### Medication
> **Consideración especial:** *antes de borrar un medicamento del catálogo, ¿qué debería comprobarse en relación a los registros de consultas que lo referencian?*

Comprobar que antes de borrar la medicación, no se le está suministrando a ningún paciente en ese momento. Ya que se entiende, que dicho paciente la necesita.