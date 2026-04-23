&#x20;Historias de Usuario - BookJournal



\---



&#x20;Historia de Usuario 1: Registro de usuarios



\*\*Como\*\* nuevo usuario del sistema,

\*\*quiero\*\* registrarme con mis datos personales (nombre, apellido, correo y contraseña),

\*\*para\*\* poder acceder a la plataforma y gestionar mis libros.



&#x20;Criterios de aceptación



\* El correo electrónico no debe estar previamente registrado

\* La contraseña debe almacenarse de forma segura (hash)

\* Los datos del usuario deben guardarse en la tabla `usuarios`

\* El sistema debe retornar confirmación de registro exitoso

\* En caso de error, debe mostrar un mensaje claro



&#x20;Consideraciones técnicas



\* Endpoint: `POST /usuarios`

\* Validación de datos en backend

\* Uso de PostgreSQL

\* Cifrado de contraseñas 



\---



&#x20;Historia de Usuario 2: Registro de libros leídos



\*\*Como\*\* usuario registrado,

\*\*quiero\*\* registrar los libros que he leído con información relevante,

\*\*para\*\* llevar un control de mi historial de lectura.



&#x20;Criterios de aceptación



\* Permitir ingresar título, autor, género y calificación

\* La calificación debe estar entre 1 y 5

\* El libro debe asociarse al usuario autenticado

\* Los datos deben guardarse en la tabla `libros\_leidos`

\* El sistema debe permitir consultar los libros registrados



&#x20;Consideraciones técnicas



\* Endpoint: `POST /libros-leidos`

\* Relación mediante clave foránea (`usuario\_id`)

\* Validaciones en backend

\* Persistencia con JPA / Hibernate



\---



&#x20;Historia de Usuario 3: Autenticación de usuarios



\*\*Como\*\* usuario registrado,

\*\*quiero\*\* iniciar sesión en el sistema,

\*\*para\*\* acceder de forma segura a mi información.



&#x20;Criterios de aceptación



\* El sistema debe validar correo y contraseña

\* La contraseña debe compararse mediante hash

\* Se debe generar un token de autenticación (JWT)

\* El acceso a endpoints debe estar protegido

\* El sistema debe rechazar credenciales inválidas



&#x20;Consideraciones técnicas



\* Endpoint: `POST /login`

\* Generación de tokens JWT

\* Middleware de autenticación

\* Integración con PostgreSQL



\---



Historia de Usuario 4: Gestión de libros deseados



\*\*Como\*\* usuario registrado,

\*\*quiero\*\* agregar libros a mi lista de deseos,

\*\*para\*\* llevar un control de los libros que quiero leer.



&#x20;Criterios de aceptación



\* Permitir ingresar título, autor, género y prioridad

\* La prioridad debe estar entre 1 y 3

\* El libro debe asociarse al usuario

\* Los datos deben guardarse en la tabla `libros\_deseados`

\* El sistema debe permitir consultar la lista de deseos



&#x20;Consideraciones técnicas



\* Endpoint: `POST /libros-deseados`

\* Relación mediante clave foránea (`usuario\_id`)

\* Validaciones en backend

\* Persistencia en base de datos



