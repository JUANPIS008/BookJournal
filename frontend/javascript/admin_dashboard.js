const API_BASE_ADMIN = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:8080/api'
    : 'https://backend-book-648962643591.southamerica-east1.run.app/api';
const API_URL_ADMIN = `${API_BASE_ADMIN}/admins`;

const admin = JSON.parse(localStorage.getItem('administradorLogueado'));

if (!admin || !admin.id) {
    window.location.href = 'admin_login.html';
}

async function cargarDashboard() {
    try {
        const headers = {
            'Content-Type': 'application/json',
            'X-Admin-Id': admin.id
        };

        const [adminsResponse, usuariosResponse] = await Promise.all([
            fetch(API_URL_ADMIN, { headers }),
            fetch(`${API_URL_ADMIN}/usuarios`, { headers })
        ]);

        if (!adminsResponse.ok || !usuariosResponse.ok) {
            alert('No autorizado o error al cargar los datos');
            window.location.href = 'admin_login.html';
            return;
        }

        const admins = await adminsResponse.json();
        const usuarios = await usuariosResponse.json();

        cargarTabla('admins-table', admins, ['id', 'nombre', 'correo', 'rol', 'fechaRegistro']);
        cargarTabla('usuarios-table', usuarios, ['id', 'nombre', 'correo', 'fechaNacimiento', 'generoFavorito', 'promedioLectura']);

    } catch (error) {
        console.error('Error dashboard:', error);
        alert('Error conectando con el servidor');
    }
}

function cargarTabla(idTabla, datos, columnas) {
    const tabla = document.getElementById(idTabla).querySelector('tbody');
    tabla.innerHTML = '';

    datos.forEach(item => {
        const fila = document.createElement('tr');
        columnas.forEach(campo => {
            const celda = document.createElement('td');
            celda.textContent = item[campo] || '';
            fila.appendChild(celda);
        });
        tabla.appendChild(fila);
    });
}

function cerrarSesion() {
    localStorage.removeItem('administradorLogueado');
    window.location.href = 'admin_login.html';
}

cargarDashboard();
