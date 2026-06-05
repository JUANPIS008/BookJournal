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