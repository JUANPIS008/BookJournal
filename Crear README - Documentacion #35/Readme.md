### 🚀 Despliegue en hosting estático (GCP)
Para el desarrollo del despliegue del frontend previamente creado, se escogió como hosting estático GCP (Google Cloud Platform), haciendo uso del servicio de Cloud Storage (Buckets).
**Guía de despliegue**

1. **Creación del Bucket**
      En el apartado de Cloud Storage se realiza la creación del bucket.
      <img width="370" alt="Creación bucket paso 1" src="https://github.com/user-attachments/assets/0b977e66-9287-4a77-abb0-628834bae23a" />
      <img width="365" alt="Creación bucket paso 2" src="https://github.com/user-attachments/assets/716ed2c6-6d75-40ea-87b1-6befd0ad8d90" />
      <img width="1915" alt="Creación bucket paso 3" src="https://github.com/user-attachments/assets/48d680bd-4f75-4897-8607-1a1aa8e91747" />

2. **Carga de Archivos**
      Se llenan los datos necesarios para la creación del bucket y luego se anexan los archivos correspondientes que componen todo el frontend.
      <img width="1918" alt="Carga de archivos frontend" src="https://github.com/user-attachments/assets/70113459-5d52-41a9-b6ca-984fb01da322" />

3. **Configuración de página principal y página de error**

       Se configura login.html como página principal del frontend y se establece la página de error correspondiente.
      <img width="708" alt="Configuración página principal y error" src="https://github.com/user-attachments/assets/e72a4fe9-6db8-4c62-be8b-15ce4dca8ff1" />

4. **Configuración de servicios Públicos**
      Un paso importante es otorgar los permisos necesarios para que usuarios externos puedan ver los estilos y la conectividad entre los componentes. Se selecciona el bucket y se dirige al apartado de Permisos.
      <img width="1917" alt="Apartado de permisos del bucket" src="https://github.com/user-attachments/assets/7c2dd7b7-2014-40f3-8698-7314ff2721ee" />
      <img width="710" alt="Configuración de permisos" src="https://github.com/user-attachments/assets/1ab4d0f0-da69-49d2-be82-90718547a67c" />
      En el menú de ➕ Agregar principal:
      
      Nueva entidad: allUsers
      Rol: Visualizador de objetos Storage

      Se guardan los cambios y el frontend queda accesible al público sin necesidad de permisos adicionales.
      <img width="1062" alt="Asignación rol allUsers paso 1" src="https://github.com/user-attachments/assets/af38f34f-5d56-4060-87b3-0a9c597fdc95" />
      <img width="1052" alt="Asignación rol allUsers paso 2" src="https://github.com/user-attachments/assets/4d66a0c5-3ea5-47be-88ea-54179ad26b9c" />

5. **Verificación de Despliegue**
Con la configuración de login.html como página principal, se accede a la URL pública generada por el bucket y se verifica que la página carga correctamente con todos sus estilos, sin necesidad de permisos.
      
      **🔗Url de frontend**
      [https://storage.googleapis.com/frontendapi/frontend/html/login.html](Frontend)
      
      <img width="1916" alt="Frontend desplegado en producción" src="https://github.com/user-attachments/assets/09b14a7f-9d7c-4e14-aeba-84d1088c4307" />

###⚙️ Configuración de Variables de Entorno

Se realizó la configuración de las variables de entorno necesarias para garantizar la correcta conexión entre el servicio backend desplegado en Cloud Run y la base de datos PostgreSQL alojada en Cloud SQL.
Configuración en application.properties
El archivo de configuración del backend se parametrizó para que los valores sean leídos dinámicamente desde variables de entorno, manteniendo valores por defecto para el entorno local:

```
spring.datasource.url=${SPRING_DATASOURCE_URL:jdbc:postgresql://localhost:5432/book_journal}
spring.datasource.username=${SPRING_DATASOURCE_USERNAME:postgres}
spring.datasource.password=${SPRING_DATASOURCE_PASSWORD:postgres}

spring.jpa.hibernate.ddl-auto=${SPRING_JPA_HIBERNATE_DDL_AUTO:update}
spring.jpa.properties.hibernate.dialect=${SPRING_JPA_PROPERTIES_HIBERNATE_DIALECT:org.hibernate.dialect.PostgreSQLDialect}
spring.jpa.show-sql=${SPRING_JPA_SHOW_SQL:true}
```

Esto permite que la aplicación utilice una configuración distinta según el entorno de ejecución (desarrollo local o producción en la 
nube), sin necesidad de modificar el código fuente.

**Variables de definidad en CloudRun**

Durante el despliegue en Google Cloud Run, se definieron las siguientes variables de entorno:

```
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost/bookjournal?socketFactory=com.google.cloud.sql.postgres.SocketFactory&cloudSqlInstance=bookjournal-493603:southamerica-east1:bookjournal2

SPRING_DATASOURCE_USERNAME=bookjournal2

SPRING_DATASOURCE_PASSWORD=********

```
**Descripción de variables**
| Variable | Descripción |
|----------|-------------|
| `SPRING_DATASOURCE_URL` | Ruta de conexión JDBC hacia PostgreSQL usando `SocketFactory` para comunicación segura con Cloud SQL |
| `SPRING_DATASOURCE_USERNAME` | Usuario utilizado por el backend para autenticarse en la base de datos |
| `SPRING_DATASOURCE_PASSWORD` | Contraseña asociada al usuario de la base de datos |

**Resultado**
Con esta configuración se aseguró la conectividad entre:
- ✅ Backend → Cloud Run
- ✅ Base de datos → Cloud SQL (PostgreSQL)
- ✅ Entorno de despliegue → Producción en GCP

### 🖥️Conectividad Frontend
Se realizó un video de demostración para evidenciar la conectividad entre los componentes que conforman el frontend del proyecto. Se muestran los siguientes flujos:

Registro de usuario
Inicio de sesión
Registro de género favorito
Horas diarias de lectura
Libros leídos
Puntuación de libros leídos
Libros deseados
Edición de perfil

🎬 [Ver video de demostración – Conectividad Frontend](https://fundacionlibertadores-my.sharepoint.com/:v:/g/personal/dmpulidom01_libertadores_edu_co/IQB5j6D9DAlZSrtQy-X3pBihAWW840B8AMuP0HwIRQjJhbo?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&e=dk7bMd)

### 🔗Conectividad Backend y Base de Datos
Se realizó un video donde se muestra:

Las variables de entorno establecidas para el backend y declaradas en GCP
La instancia de la base de datos con sus respectivos puertos y credenciales de ingreso
La URL del backend
La imagen de Docker en la que fue montado el servicio

Todo esto con el fin de demostrar la funcionalidad entre los componentes del backend.
🎬 [Ver video de demostración – Conectividad Backend y BD](https://fundacionlibertadores-my.sharepoint.com/:v:/g/personal/dmpulidom01_libertadores_edu_co/IQBQTER911pATpmkj9c-vy4iAdqB6mtQWqKX_vGL81n3PD4?e=rhNcxO&nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJTdHJlYW1XZWJBcHAiLCJyZWZlcnJhbFZpZXciOiJTaGFyZURpYWxvZy1MaW5rIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXcifX0%3D)

### 🗄️ Consultas de Verificación – Base de Datos
Para la demostración práctica de la base de datos, se ejecutaron diversas consultas que evidencian el correcto funcionamiento del sistema y la persistencia en tiempo real de los usuarios registrados desde el frontend.
**Mostrar todos los usuarios**
`SELECT * FROM usuario;`
**Mostrar solo los campos importantes de los usuarios**
`SELECT id, nombre, correo
FROM usuario;`
**Contar cuántos usuarios hay**
`SELECT COUNT(*) AS total_usuarios
FROM usuario;`
**Mostrar todos los libros**
`SELECT * FROM libros;`
**Contar libros**
`SELECT * FROM libros;`
**Mostrar deseos**
`SELECT * FROM deseo;`
**Mostrar últimos registros**
`SELECT *
FROM usuario
ORDER BY id DESC
LIMIT 5;`
**Mostrar estructura de una tabla**
`SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'usuario';`