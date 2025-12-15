# PROYECTO-FINAL_GUTIERREZ-SARA
### Plataforma de rehabilitación para gestionar y consultar ejercicios, usuarios y pacientes.
---
### `index.html`
En este código se agregaron las funciones necesarias para crear la página de inicio de la página web. Se utilizaron botones con las opciones disponisbles dependiendo del rol del usuario, un navbar y una corta descripción del contenido. 

---
### `server.js`
Este código permite dar los permisos necesarios a los usuarios a rutas especificas dependiendo de su rol, permite descargar los archivos Excel, acceder a páginas web extras, entre otras funciones necesarias para que funcione correctamente la pagina web.


---
### `.env`
Este código da el acceso a la base de datos del localhost que realizo la página web. 

---
### `register.html`
En este html se da el espacio para ingresar nuevos usuarios con nombre, correo, contraseña y código de acceso.

---
### `login.html`
Permite que usuarios previamente registrados entren a la página web para accesar a sus funicones con nombre o correo y contraseña.

---
### `usuarios.html`
Permite observar la información de ingreso de los usuarios accesible sólo para el admin.

---
### `usuarios-editar.html`
Permite que el admin pueda editar la información de los usuarios o eliminar el registro.

---
### `registro.html`
Permite realizar registros de pacientes con su nombre, el ejercicio realizado, observaciones y fecha. Estas opciones estarán disponibles para el admin, fisio y paciente, pero solo el admin y el fisio podrán descargar la tabla con los pacientes.

---
### `pacientes.html`
Es la página principal del apartado de pacientes, donde se encuentran los botones para añadir un nuevo paciente y ver la tabla completa. Estas acciones sólo están disponibles para el admin y el fisio.

---
### `pacientes-nuevo.html`
Es la extensión a la que se abre el botón de "Añadir paciente", donde salen las opciones de nombre, edad, lesión, estado de salud y fecha. 

---
### `pacientes-mostras.html`
Es la extensión del botón "Ver lista de pacientes", donde se muestra la tabla con opciones de editar y eliminar datos. También se puede descargar un archio Excel con la tabla de los pacientes.

--- 
### `pacientes-editar.html`
Contiene los códigos necesarios para editar la información de los pacientes y guardar los cambios en la base de datos.

---
### `ejercicios.html`
Es la página principal del apartado de ejercicios, donde se encuentran botones para añadir un nuevo ejercicio, editar la tabla, mostrar la tabla y buscar el tipo de ejercicio. EL admin y fisio pueden accesar a todas las opciones, el paciente solo puede ver la tabla de los ejercicios disponibles.

---
### `ejercicios-nuevo.html`
Es la extensión del botón "Añadir nuevo ejercicio", que despliega unos campos a llenar con el nombre del ejercicio, zona del cuerpo que ayuda y una descripción. El admin y fisio pueden accesar.

---
### `ejercicios-mostrar.html`
Es la extensión del botón "Mostrar tabla de ejercicios", donde se puede ver la tabla completa con los ejercicios ingresados por el admin o el fisio. También se puede descargar una tabla de Excel con la información completa.

---
### `ejercicios-editar.html`
Es la extensión del botón "Editar tabla de ejercicios", donde se puede cambiar o eliminar la información de los ejercicios de fisioterapia.

---
### `ejercicios-busqueda.html`
Es la extensión del botón "Búsqueda de ejercicio", el cual permite buscar en tiempo real cualquier ejercicio co cualquier dato.

---
### `db.js`
Contiene las librerías requeridas y la información del localhost.

