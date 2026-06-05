# Ánalisis de seguridad - BookJournal.

## 1. Vulnerabilidades identificadas por el equipo.

### 1.1 Contraseñas almacenadas en texto plano.
Las contraseñas de los usuarios son guardadas directamente en la base de datos sin ningún tipo de cifrado. Si la base de datos se ve comprometida, las contraseñas almacenadas en la aplicación se veran afectadas de manera inmediata.
**Riesgo:** Alto

### 1.2 Carencia de validación de roles.
El sistema no es capaz de verificar el rol del usuario autenticado al momento de acceder a los endpoints. Cualquier usuario que desee ingresar a operaciones que se caracterizan por ser de administrador tendrá la posibilidad de hacerlo actualmente.
**Riesgo:** Alto

### 1.3 Construcción manual de consultas sql.
Algunas consultas constryen haciendo una conexión directamente parámetros del usuario, lo cuál deja la posibilidad de ataques de inyección SQL en dónde el atacante logra manipular las consultas para la extracción, modificación y eliminación de datos.
**Riesgo:** Alto

### 1.4 Uso de HTTP en lugar de HTTPS.
La API corre sobre un HTTP plano. Cualquier tráfico interceptado en la red expone tokens, credenciales y datos sensibles en texto claro, siendo vulnerable a ataques de tipo man-in-the-middle.
**Riego:**Alto

### 1.5 CORS demasiado permisivo.
La configuración actual permite realizar solicitudes desde cualquier origen (`@CrossOrigin(origins = "*")`), lo que permite que cualquier sitio web externo pueda hacer solicitudes a la API en nombre del usuario.
**Riesgo:** Medio

### 1.6 Intentos ilimitados de inicio de sesión.
El sistema no tiene límite en la cantidad de intentos de login fallidos. Esto permite que los ataques de fuerza bruta donde un atacante puede probar miles de contraseñas sin ser bloqueado.
**Riesgo:** Medio

### Vulnerabilidad a ataques DoS/DDoS.
No existe nigún mecanismo de limitaciones de solicitudes (rate limiting). Un atacante puede saturar el servidor con miles de peticiones simultáneas dejándolo sin recuros y sin disponibilidad para usuarios legítimos.
**Riesgo:** Medio
---
## 2. Medidas implementadas

## Autenticación de dos factores (2FA).

### ¿Qué se implementó?
Se implementó una autenticación de dos factores usando TOTP (Time-based One-Time Password), compatible con Google Authenticator. Eso agrega una segunda capa de verificación al login: además de ingresar la contraseña, el usuario necesitará de un código de 6 dígitos el cual tiene una duración de 30 segundos y solo existen en el celular del usuario.

Esta medida permite mitigar de forma directa y atajante el riesgo de accesos no autorizados. Sin embargo, aunque el atacante obtenga la contraseña del usuario (ya sea por fuerza burta, phishing o por las contraseñas almacenadas en texto plano), no puede acceder al sistemas si también tener el dispositivo físico del usuario.

Para lograr la implementación se usó la libreria `dev.samstevens.totp v1.7.1`, que maneja toda la lógica criptográfica del TOTP: generación de secretos, creación de códigos QR y verificación de códigos temporales.

### Archivos modificacos.

**`pom.xml`**  
Se agregó la dependencia `dev.samstevens.totp v1.7.1`:
```xml

    dev.samstevens.totp
    totp
    1.7.1

```

**`model/Usuario.java`**  
Se agregaron dos campos nuevos a la entidad para soportar el 2FA:
```java
@Column(name = "two_factor_secret")
private String twoFactorSecret;

@Column(name = "two_factor_enabled")
private boolean twoFactorEnabled = false;
```
- `twoFactorSecret` — guarda el secreto único generado para cada usuario.
- `twoFactorEnabled` — indica si el usuario tiene el 2FA activo o no.

---
### Archivos creados.

**`security/TwoFactorService.java`**  
Contiene toda la lógica del 2FA:
- `generateSecret()` — genera un secreto aleatorio único para el usuario
- `generateQrImageUri()` — convierte el secreto en un código QR en formato imagen 
  base64 para que el usuario lo escanee con Google Authenticator
- `verifyCode()` — valida que el código de 6 dígitos ingresado sea correcto en 
  ese momento, teniendo en cuenta la ventana de tiempo de 30 segundos.

  Expone los endpoints REST para el flujo completo del 2FA:

| Método | Endpoint          | Descripción                                              |
|--------|-------------------|----------------------------------------------------------|
| POST   | /api/2fa/setup    | Genera el secreto del usuario y devuelve el QR en base64 |
| POST   | /api/2fa/verify   | Confirma que el QR fue escaneado correctamente y activa el 2FA |
| POST   | /api/2fa/validate | Valida el código de 6 dígitos durante el login           |

**Ejemplo de request para cada endpoint:**

`/api/2fa/setup`
```json
{
  "correo": "usuario@ejemplo.com"
}
```
Respuesta:
```json
{
  "qrCode": "data:image/png;base64,..."
}
```

`/api/2fa/verify`
```json
{
  "correo": "usuario@ejemplo.com",
  "code": "687118"
}
```
Respuesta:
```json
{
  "message": "2FA activado correctamente"
}
```

`/api/2fa/validate`
```json
{
  "correo": "usuario@ejemplo.com",
  "code": "423591"
}
```
Respuesta exitosa:
```json
{
  "valid": true
}
```
Respuesta con código incorrecto:
```json
{
  "error": "Código 2FA incorrecto"
}
```
---
### Flujo de funcionamiento.
1. El usuario se registra normalmente con nombre, correo y contraseña
2. El usuario solicita activar el 2FA → POST /api/2fa/setup
3. El sistema genera un secreto único y lo guarda en la BD
4. El sistema devuelve un código QR como imagen
5. El usuario pega la imagen en el navegador y la escanea con Google Authenticator
6. Google Authenticator empieza a generar códigos de 6 dígitos cada 30 segundos
7. El usuario confirma el escaneo enviando el primer código → POST /api/2fa/verify
8. El sistema valida el código y activa el 2FA (twoFactorEnabled = true)
9. A partir de ese momento, en cada login el usuario debe validar su código
→ POST /api/2fa/validate
10. Si el código es correcto → acceso permitido
11. Si el código es incorrecto → 401 Unauthorized

---
## 3. Medidas pendientes.
| Vulnerabilidad | Medida recomendada | Por qué no se implementó aún |
|---|---|---|
| Contraseñas en texto plano | Cifrar con BCrypt usando `PasswordEncoder` de Spring Security | Requiere migrar contraseñas existentes y modificar el servicio de autenticación y registro |
| Validación de roles (RBAC) | Agregar campo `rol` a la entidad Usuario y configurar `@PreAuthorize` en los endpoints | Requiere rediseño del modelo de usuarios |
| HTTPS en producción | Configurar certificado SSL/TLS vinculado al dominio | En el alcance actual el despliegue es local para sustentación |
| CORS restrictivo | Reemplazar `origins = "*"` por los dominios específicos del frontend | Pendiente de definir el dominio de producción |
| Límite de intentos de login | Implementar rate limiting con la librería Bucket4j | Mayor tiempo de desarrollo requerido |
| Protección DoS/DDoS | Configurar WAF o Cloudflare | Requiere infraestructura adicional fuera del alcance académico |
| Códigos de recuperación 2FA | Generar códigos de respaldo para cuando el usuario pierde el celular | Se planea para una siguiente iteración |

## 4. Plan de respuesta e incidentes.
Si el equipo detecta acceso no autorizado o datos comprometidos, se procederá así: 
primero se revocarán todos los tokens JWT activos cambiando el secreto de firma. 
Segundo, se auditarán los logs del servidor para identificar el origen y alcance 
del acceso. Tercero, se notificará a los usuarios afectados y se forzará el 
restablecimiento de contraseñas y la reconfiguración del 2FA. Finalmente, se 
documentará el incidente, se identificará la vulnerabilidad explotada y se aplicará 
el parche correspondiente antes de volver a poner el sistema en línea.


Aquí está el texto completo:

---

# Seguridad - BookJournal firewall de aplicaciones WEB


Se describe las medidas de seguridad implementadas en el backend de BookJournal, incluyendo el Firewall de Aplicaciones Web (WAF) configurado con Nginx y las reglas de control de tráfico activas.

---

## Arquitectura de Seguridad

```
Cliente
   │
   ▼
┌─────────────────────────┐
│   Nginx WAF :8081       │  ← Primera línea de defensa
│   (nginx:alpine)        │
└────────────┬────────────┘
             │ Solo tráfico limpio
             ▼
┌─────────────────────────┐
│   Spring Boot :8080     │  ← Backend
│   (spring-book)         │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│   PostgreSQL :5432      │  ← Base de datos
│   (postgres-book)       │
└─────────────────────────┘
```

Todo el tráfico externo entra por el puerto `8081` a través de Nginx. El backend en el puerto `8080` y la base de datos en el puerto `5432` no son accesibles directamente desde fuera de la red Docker.

---

## Componentes de Seguridad

### 1. Firewall de Aplicaciones Web (WAF) — Nginx

**Contenedor:** `nginx-waf-book`  
**Imagen:** `nginx:alpine`  
**Puerto expuesto:** `8081`  
**Archivo de configuración:** `backend/nginx/nginx.conf`

Nginx actúa como proxy inverso y aplica reglas de seguridad antes de que cualquier petición llegue a Spring Boot.

---

### 2. Protecciones Implementadas

#### 2.1 Bloqueo de SQL Injection

Detecta y bloquea peticiones que contengan palabras clave propias de ataques de inyección SQL en los parámetros de la URL.

**Palabras bloqueadas:** `union`, `select`, `insert`, `drop`, `delete`, `script`

**Respuesta:** `403 Forbidden`

**Ejemplo de petición bloqueada:**
```
GET /api/libros?q=select*from usuarios
→ 403 Forbidden
```

#### 2.2 Bloqueo de Métodos HTTP Peligrosos

Solo se permiten los métodos HTTP estándar necesarios para la API REST. Cualquier otro método es rechazado.

**Métodos permitidos:** `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`

**Respuesta:** `405 Method Not Allowed`

**Ejemplo de petición bloqueada:**
```
TRACE /api/libros
→ 405 Method Not Allowed
```

#### 2.3 Rate Limiting (Límite de Peticiones)

Limita la cantidad de peticiones que una misma IP puede hacer por segundo, protegiendo contra ataques de denegación de servicio (DoS) y fuerza bruta.

| Parámetro | Valor |
|---|---|
| Peticiones por segundo | 10 |
| Burst permitido | 20 |
| Zona de memoria | 10MB |

Si una IP supera el límite, las peticiones adicionales son rechazadas con `503 Service Unavailable`.

#### 2.4 Ocultamiento de Información del Servidor

La directiva `server_tokens off` impide que Nginx revele su versión en las cabeceras HTTP de respuesta, reduciendo la superficie de ataque.

**Sin protección:**
```
Server: nginx/1.25.3
```

**Con protección:**
```
Server: nginx
```

#### 2.5 Límite de Tamaño de Peticiones

Se restringe el tamaño máximo del cuerpo de las peticiones a `10MB` para evitar ataques de payload excesivo.

---

### 3. Configuración de Red Docker

Los servicios internos están protegidos por la red interna de Docker:

| Servicio | Puerto interno | Puerto externo | Acceso |
|---|---|---|---|
| Nginx WAF | 80 | 8081 | Público (punto de entrada) |
| Spring Boot | 8080 | 8080 | Público (acceso directo, sin WAF) |
| PostgreSQL | 5432 | 5433 | Solo red Docker |
| pgAdmin | 80 | 5050 | Local |

> **Recomendación para producción:** Eliminar la exposición directa del puerto `8080` de Spring Boot, dejando `8081` como único punto de entrada.

---

## Configuración del WAF

Archivo: `backend/nginx/nginx.conf`

```nginx
events {}

http {
    server_tokens off;
    client_max_body_size 10M;
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

    server {
        listen 80;

        if ($request_method !~ ^(GET|POST|PUT|DELETE|OPTIONS)$) {
            return 405;
        }

        if ($query_string ~* "(union|select|insert|drop|delete|script)") {
            return 403;
        }

        location / {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://spring-book:8080;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
}
```

---

## Monitoreo de Tráfico

Para visualizar el tráfico en tiempo real que pasa por el WAF:

```bash
docker logs nginx-waf-book -f
```

Para probar que el bloqueo de SQL Injection funciona:

```bash
curl "http://localhost:8081/api/libros?q=select*from usuarios"
# Respuesta esperada: 403 Forbidden
```

Para probar que el rate limiting funciona:

```bash
for i in {1..15}; do curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8081/api/libros; done
# Las últimas peticiones deben devolver 503
```

---

## Levantar el Proyecto con Seguridad

```bash
docker compose up -d
docker compose ps
```

Todos los servicios deben aparecer con estado `Up`:

```
nginx-waf-book   Up   0.0.0.0:8081->80/tcp
spring-book      Up   0.0.0.0:8080->8080/tcp
postgres-book    Up   0.0.0.0:5433->5432/tcp
pgadmin-book     Up   0.0.0.0:5050->80/tcp
```

---

## Mejoras Futuras

- Migrar autenticación a JWT
- Agregar HTTPS con certificado SSL
- Configurar ModSecurity para reglas WAF más avanzadas
- Bloquear acceso directo al puerto 8080 en producción
- Implementar lista blanca de IPs para entornos restringidos
