# BookJournal
## Estructura del proyecto
```
    Book-Journal/
    ├── frontend/                   // Interfaz de usuario y lógica de cliente
    │   ├── html/                   // Vistas de la aplicación
    │   │   ├── login.html          // Acceso al sistema
    │   │   ├── registro.html       // Creación de nuevas cuentas
    │   │   ├── perfil.html         // Datos del usuario y configuración
    │   │   ├── lista_deseos.html   // Libros pendientes por leer
    │   │   ├── lectura_actual.html // Seguimiento del libro en curso
    │   │   ├── libros_leidos.html  // Historial y calificación (estrellas)
    │   │   └── home.html           // Pantalla principal / Dashboard
    │   ├── css/                    // Estilos visuales consolidados
    │   │   ├── estilos.css         // Archivo unificado de estilos
    │   │   └── componentes.css     // Estilos de cards, botones y estrellas
    │   ├── java-script/            // Lógica de interacción y consumo de API
    │   │   ├── login.js            // Validación y envío de credenciales
    │   │   ├── registro.js         // Lógica de creación de usuarios
    │   │   ├── historial.js        // Manejo de la lista de libros y estrellas
    │   │   └── api-config.js       // Configuración de Fetch y endpoints
    │   └── recursos/               // Activos estáticos y multimedia
    │       ├── Imagen1.png         // Decoraciones de libros
    │       ├── Imagen2.png         // Decoraciones laterales del diario
    │       └── icon-perfil.png     // Avatar por defecto del usuario
    ├── Book-Journal/
    ├── backend/                   // Código fuente en Java (Spring Boot)
    │   ├── src/main/java/com/bookjournal/
    │   │   ├── controllers/       // Endpoints REST (@RestController)
    │   │   ├── models/            // Entidades de base de datos (@Entity)
    │   │   ├── repositories/      // Interfaces para consultas SQL (JPA)
    │   │   ├── services/          // Lógica de negocio avanzada
    │   │   └── security/          // Configuración de filtros y JWT
    │   ├── src/main/resources/
    │   │   └── application.properties // Configuración de conexión a PostgreSQL
    │   └── pom.xml                // Dependencias de Maven
    ├── database/                   // Persistencia de datos (PostgreSQL)
    │   ├── scripts/                // Scripts de creación de tablas y datos iniciales
    │   │   ├── create_tables.sql   // Definición de tablas de usuarios y libros
    │   │   └── seed_data.sql       // Datos de prueba para el desarrollo
    │   └── diagramas/              // Modelo Entidad-Relación (MER)
    └── README.md                   // Documentación técnica completa del proyecto
```

## Explicación estructura del Proyecto
Se crearon 7 archivos HTML:
- edit_perfil.html  
- lectura_actual.html  
- libros_leidos.html  
- lista_deseos.html  
- login.html  
- registro.html  
- perfil.html  

Cada HTML cuenta con su archivo CSS correspondiente, para mantener una estructura organizada y facilita la modificación de estilos de cada HTML sin generar conflicto con los demas.

También se creó un archivo JavaScript por cada módulo, encargado de:
- La interacción entre módulos
- El funcionamiento de botones
- El envío y recepción de datos con la API
- El manejo de errores (conexión, validaciones y eliminación de datos)

## Frontend Laura Lopez
## Índice frontend
- [Descripción](#descripcion)
- [Módulos](#módulos)
- [Componentes Compartidos](#componentes-compartidos)
- [Estilos CSS](#estilos-css)
- [Lógica JavaScript](#lógica-javascript)
- [Stack Tecnológico](#stack-tecnológico)

## Descripción

El frontend de BOOK JOURNAL está estructurado en módulos independientes pero interconectados. Cada módulo contiene su propio archivo HTML, CSS y JavaScript, esto permite facilitar el mantenimiento del código y mejorar la escalabilidad de la pagina.

La pagina permite gestionar usuarios, registrar libros, visualizar historial de lectura y administrar listas de deseos de futuas lecturas.

- html: contiene la estructura visual de cada página.
- css: define los estilos visuales.
- java-script: contiene la lógica de interacción y conexión con la API.
- recursos: almacena imágenes y elementos gráficos.

## Módulos

### Login
formulario para el ingreso a las pagina de Book Journal se solicita que se ingrese el correo o usuario y la contraseña además de dos botones el que da inicio de sesión y otro que dirige a la página de registro. Además, tiene una imagen de unos libros.

![captura de pantalla login](imagenesdoc/Login.png)

```html
<form id="loginForm">
    <input type="text" id="correo" placeholder="Correo">
    <input type="password" id="password" placeholder="Contraseña">

    <button type="submit">Iniciar sesión</button>

    <button type="button" onclick="window.location.href='registro.html'">
        Registrarse
    </button>
</form>
```

- se define un formulario que será capturado por JavaScript mediante su id.
- se muestran los campos donde el usuario ingresa el correo y la contraseña, en el caso de la contraseña los caracteres estan ocultos
- boton que activa el evento submit del formulario.
- no envía el formulario, solo ejecuta una acción en caso que las credenciales sean correctas y se dirige a la pagina principal lectura_actual.html

### Registro
formulario diseñado para capturar los datos de un nuevo usuario (nombre completo, correo electrónico, crear una contraseña, fecha de nacimiento, promedio de lectura diaria y genero favorito), tiene dos botones Finalizar registro para que se guarden los datos del formulario en la base de datos y volver para regresar a login.


![captura de pantalla registo](imagenesdoc/Registro.png)

```html
<form id="registroForm">
    <input id="nombre">
    <input id="correo">
    <input id="password">
    <input id="confirmar">

    <button>Registrar</button>
</form>
```

- Captura los datos necesarios para crear un usuario.
- El botón ejecuta el evento submit que será interceptado por JavaScript.
- No hay validaciones en HTML, todas se hacen en JavaScript.

### Perfil

![Captura de pantalla perfil](imagenesdoc/Perfil.png)

```html
<div id="perfil">
    <p id="nombre"></p>
    <p id="correo"></p>
</div>
```

- los datos se muestran encontenedor principal y se utiliza `<p>` para mostrar datos dinámicos.


## Editar Peril
Formulario sencillo para el ingreso de nuevos libros a la lista de deseos, una vez ingresados los libros que se desea ver en el futuro cada libro aparecerá en una tarjeta y se permite seleccionar cuando ya se hallando leído.

![Captura de pantalla editar el perfil](imagenesdoc/Edit_perfil.png)

```html
<form id="form-editar-perfil" class="datos-perfil" autocomplete="off">
            <div class="campo">
                <label for="nombre">Nombre completo:</label>
                <input type="text" id="nombre" name="nombre" required>
            </div>
            <div class="campo">
                <label for="correo">Correo:</label>
                <input type="email" id="correo" name="correo" required>
            </div>
            <div class="campo">
                <label for="fechaNacimiento">Fecha de nacimiento:</label>
                <input type="date" id="fechaNacimiento" name="fechaNacimiento" required>
            </div>
            <div class="campo">
                <label for="promedioLectura">Promedio de lectura (min):</label>
                <input type="number" id="promedioLectura" name="promedioLectura" required>
            </div>
            <div class="campo">
                <label for="generoFavorito">Género favorito:</label>
                <input type="text" id="generoFavorito" name="generoFavorito" required>
            </div>
            <div class="botones-acciones">
                <button type="submit" class="btn-editar">Guardar Cambios</button>
                <button type="button" onclick="irperfil()" class="btn-cancelar">Cancelar</button>
            </div>
        </form>
```

## Lista Deseos
formulario donde se ingresa los datos sobre un libro que se está leyendo en el momento (Nombre del libro, autor, genero, reseña, fecha inicio y fecha final, calificación mediante 5 estrellas interactivas). al final del formulario tiene un botón el cual permite guardar los datos del formulario y se dirige al módulo de libros leídos.

![Captura de pantalla lista libros deseados](imagenesdoc/Lista_deseos.png)

```html
        <div class="container">
            <h1 class="titulo-libros-deseados">Lista de libros deseados</h1>
            <div class="lista-libros-deseados" id="lista-deseados">
                <div class="input-section">
                    <input type="text" id="wish-input" placeholder="Escribe un libro que desees...">
                    <button onclick="addWish()">Agregar</button>
                </div>
                <div id="lista-deseos-container"></div>
            </div>
        </div>
```

## Lectura Actual
 en este módulo se pueden visualizar los libros que ya se han agregado desde el módulo lectura actual, cada libro aparece en una tarjeta diferente y se puede borrar en caso de que haya un error o solo se quiera borrar del registro, este módulo cuenta con una barra de búsqueda, en la cual se podrá buscar dentro de la base de datos.

![Captura de pantalla lectura actual](imagenesdoc/Lectura_actual.png)

```html
<div class="form-content">
                <input type="text" id="titulo" placeholder="Nombre del Libro" required>
                <input type="text" id="autor" placeholder="Autor" required>
                <input type="text" id="genero" placeholder="Género">
                <textarea id="resena" placeholder="Escribe aquí tu reseña o notas sobre el libro..."></textarea>
                <div class="fechas">
                    <div class="date-group">
                        <label for="inicio">Fecha de inicio</label>
                        <input type="date" id="inicio">
                    </div>
                    <div class="date-group">
                        <label for="final">Fecha de fin</label>
                        <input type="date" id="final">
                    </div>
                </div>
                <div class="rating-container">
                    <label>Calificación:</label>
                    <div class="stars" id="star-rating">
                        <span class="star" data-value="1">★</span>
                        <span class="star" data-value="2">★</span>
                        <span class="star" data-value="3">★</span>
                        <span class="star" data-value="4">★</span>
                        <span class="star" data-value="5">★</span>
                    </div>
                    <input type="hidden" id="calificacion" value="0">
                </div>
                <button type="button" class="boton_terminar_lectura" onclick="Guardar_libro()">
                    Finalizar lectura
                </button>
            </div>
```

## Libros Leidos

Para cada uno de los módulos se creó un css personalizado a pesar de que muchas de las funciones son muy parecidas hay algunas funciones diferentes en cada módulo, a nivel general los css tiene dos fuentes (Patrick hand y dancing script), da tonalidades verdes y pone imágenes decorativas de hojas. en el caso de lectura actual y libros leídos también maneja las interacciones de colores de las estrellas, también permite visualizar mejor las fechas.

![Captura de pantalla lista de libros leidos](imagenesdoc/Libros_leidos.png)

```html
<div style="margin-bottom:20px;">
                <input type="text" id="busqueda" placeholder="Buscar libro..." 
                       style="padding:10px; width:70%;">
                <button onclick="buscarLibros()" style="padding:10px;">
                    Buscar
                </button>
            </div>
            <div class="historia-containerS" id="historial-libros">
                <!-- Aquí se renderizan los libros -->
            </div>
```

### Componentes Compartidos
### Navbar 
una vez dentro de la página de Book Journal hay partes que se comparten en todos los módulos. En la parte superior se encuentra una barra, en la parte izquierda se encuentra un menú desplegable en el cual se puede navegar en toda la página (lectura actual, libros leídos, libros deseados y cerrar sesión) en la mitad se encuentra el nombre de la página BOOK JOURNAL y en la parte derecha esta una imagen que funciona como un botón el cual llevara al módulo de perfil.

![Captura de pantalla navbar](imagenesdoc/Navbar.png)
![Captura de menu desplegable ](imagenesdoc/Menu_desplegable.png)

```html
<header>
    <h1>BOOK JOURNAL</h1>

    <nav>
        <a href="lectura_actual.html">Lectura actual</a>
        <a href="libros_leidos.html">Libros leídos</a>
        <a href="lista_deseos.html">Deseados</a>
        <a onclick="cerrarSesion()">Cerrar sesión</a>
    </nav>

    <img src="perfil.png" onclick="window.location.href='perfil.html'">
</header>
```

- `<header>` contenedor principal de navegación.
- `<nav>` agrupa los enlaces.
- `<a href="">` navegación entre páginas.
- `onclick` ejecuta funciones JavaScript directamente.
- `<img>` funciona como botón de acceso al perfil.


## Estilos CSS
En los archivos CSS hay partes que estan repetidas como body el cual controla el color de fondo de toda la pagina los tipos de letras, el color de los botones etc.

### Estilo base del documento

```css
body {
    font-family: 'Patrick Hand', cursive;
    background-color: #e6f2e6;
    margin: 0;
    padding: 0;
}
```

- Define la tipografía principal de toda la aplicación usando una fuente tipo manuscrita.
- Aplica un color de fondo verde claro para mantener la estética del diario.
- Elimina los márgenes y espacios por defecto del navegador para evitar inconsistencias visuales.

## Tipografia 
```
    font-family: 'Patrick Hand', cursive;
    font-family: 'Dancing Script', cursive;
```
![Captura de titulo y tipografia](imagenesdoc/Titulos_tipografia.png) 

- define el tipo de letra que va a tener la pafina.

### Botones
![Captura de pantalla botones](imagenesdoc/Botones.png)

```css
button {
    background-color: green;
    color: white;
    border: none;
    padding: 10px 15px;
    border-radius: 8px;
    cursor: pointer;
}
```

- Define el color principal del botón (verde).
- Establece el color del texto en blanco para contraste.
- Elimina los bordes por defecto del navegador.
- Agrega espacio interno para mejorar la apariencia y el tamaño del botón.
- Redondea las esquinas para un diseño más moderno.
- Cambia el cursor a tipo "pointer" para indicar que es interactivo.


### Interacción de botones (hover)

```css
button:hover {
    background-color: darkgreen;
}
```

- Cambia el color del botón cuando el usuario pasa el cursor encima.
- Proporciona retroalimentación visual de interacción.
- Mejora la experiencia del usuario al indicar que el botón es clickeable.


### Inputs y áreas de texto

![Captura de pantalla input en formularios](Imagenesdoc/Formularios.png)

```css
input, textarea {
    padding: 10px;
    border-radius: 5px;
    border: 1px solid #ccc;
    width: 100%;
    margin-bottom: 10px;
}
```

- Aplica espacio interno para mejorar la legibilidad del texto ingresado.
- Redondea los bordes para mantener coherencia con el diseño general.
- Añade un borde gris claro para delimitar los campos.
- Hace que los inputs ocupen todo el ancho disponible.
- Agrega separación entre campos para evitar que se vean pegados.


### Cards de libros

![Captura de pantalla cards de los libros e historial](imagenesdoc/Tarjetas_libros.png)

```css
.card {
    background-color: white;
    border-radius: 10px;
    padding: 15px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}
```

- Define un fondo blanco para separar visualmente las tarjetas del fondo general.
- Redondea los bordes para mantener el estilo del sistema.
- Añade espacio interno para organizar el contenido.
- Aplica una sombra ligera para dar sensación de profundidad.

## Sistema de Estrellas
![Captura de pantalla sistema de estrellas calificacion](imagenesdoc/Sistema_estrellas.png)

## Perfil e Imágenes Laterales
![Captura de pantalla Perfil y hojas de corativas](imagenesdoc/Perfil-hojasdecorativas.png)

### Barra de navegación (Navbar)

```css
header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #2e7d32;
    color: white;
    padding: 10px;
}
```
- Usa `flexbox` para organizar los elementos en una fila horizontal.
- Distribuye los elementos (logo, menú, perfil) con espacio entre ellos.
- Centra verticalmente todos los elementos.
- Aplica un color verde oscuro como fondo principal de navegación.
- Define el color del texto en blanco para contraste.
- Añade espacio interno para mejorar la apariencia.


### Enlaces de navegación

```css
nav a {
    margin: 0 10px;
    color: white;
    text-decoration: none;
}
```
- Agrega espacio horizontal entre los enlaces del menú.
- Mantiene el color blanco para coherencia con la navbar.
- Elimina el subrayado por defecto de los enlaces.


### Interacción en enlaces

```css
nav a:hover {
    text-decoration: underline;
}
```
- Añade un subrayado cuando el usuario pasa el cursor.
- Indica visualmente que el enlace es interactivo.
- Mejora la accesibilidad y experiencia de navegación.


## Lógica JavaScript
En esta parte se podra encontrar la forma logica en la que funciona toda la pagina web, como la navegacion entre modulos, como funcionan los botones, etc.

### Login.js

```javascript
document.getElementById("loginForm").addEventListener("submit", async (e) => {
```

- Selecciona el formulario.
- Escucha el evento submit.
- `async` permite usar `await`.


```javascript
e.preventDefault();
```
Evita que el formulario recargue la página.


```javascript
const correo = document.getElementById("correo").value;
const password = document.getElementById("password").value;
```
Obtiene los valores ingresados por el usuario.


```javascript
if (!correo || !password) {
    alert("Completa todos los campos");
    return;
}
```
Valida que los campos no estén vacíos.


```javascript
const respuesta = await fetch(`${API_URL}/login`, {
```
Realiza una petición HTTP al backend.


```javascript
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ correo, password })
```

- POST: envía datos.
- headers: indica formato JSON.
- body: convierte el objeto a JSON.


```javascript
if (!respuesta.ok) {
    alert("Credenciales incorrectas");
    return;
}
```

Valida si la respuesta HTTP fue exitosa.


```javascript
const usuario = await respuesta.json();
```
Convierte la respuesta en un objeto JavaScript.


```javascript
localStorage.setItem("usuarioLogueado", JSON.stringify(usuario));
```
Guarda la sesión en el navegador.


```javascript
window.location.href = "lectura_actual.html";
```
Redirige al usuario.


```javascript
} catch (error) {
    console.error(error);
    alert("Error de conexión");
}
```
Captura errores de red o del servidor.

## Stack Tecnológico
1. Frontend: Maneja la lógica de interacción y estilos interfaz con el cliente.
    - Lenguaje base: HTML5 para la estructura de cada pagina (login.html, registro.html, perfil.html, edit_perfil.html, lista_deseos.html, lectura_actual.html y libros_leidos.html) y css3 para el diseño visual (login.css, registro.css, perfil.css, edit_perfil.css, lista_deseos.css, lectura_actual.css y libros_leidos.css).
    - Tipografía: Integración con Google Font (Dancing Script y Patrick Hand)
    - Lógica de interfaz: JavaScript, se encara de capturar los datos y actualizarlos por medio de clicks y envíos de formularios con datos  (login.js, registro.js, perfil.js, edit_perfil.js, lista_deseos.js, lectura_actual.js y libros_leidos.js)
    - Comunicación: Fetch api, actúa como el mensajero, es quien envía los datos desde los formularios hasta el backend. 

2. Backend: se encarga de procesar la lógica de negocio, gestionar la comunicación con la base de datos y garantizar la seguridad y autenticación de los datos del usuario.
    - Lenguaje: Java 
    - Framework principal: Spring Boot
    - Gestión de dependencias: Maven archivo pom.xml
    - Acceso a datos: Spring data JPA/ Hibernate, permite mapear las clases de java
    - Seguridad: Spring Security para manejo de sesiones.
    - Servidor embebido: Tomcat viene con Spring Boot para correr la aplicación.
    - Control para problemas de versiones: Se creo un Docker el cual permite que cualquier persona pueda ejecutar la aplicación sin problemas de versionamiento.

3. Base de datos: la información capturada por los formularios deja de estar solo en la aplicación y se guarda de forma permanente.
    - Motor de base de datos: PostgreSQL, para gestionar la base de datos relacionadas.
    - Lenguaje de consulta: SQL, creación de tablas, agregar registros nuevos (formularios de ingreso i edición de datos) y consultarlos (búsqueda en libros leídos).
    - Conexión red: La comunicación con el servidor se realiza mediante un túnel de datos dirigido al puerto 5432, garantizando un flujo de información constante y seguro.
    - Creación de instancia: Se configuró una instancia dedicada del motor de base de datos, proporcionando un entorno de ejecución aislado, estable y optimizado para el proyecto.
