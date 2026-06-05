const API_BASE_ADMIN = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:8080/api'
    : 'https://backend-book-648962643591.southamerica-east1.run.app/api';
const API_URL_ADMIN = `${API_BASE_ADMIN}/admins`;

function volverInicio() {
    window.location.href = "login.html";
}

async function loginAdmin() {
    const correo = document.getElementById('admin-email').value;
    const password = document.getElementById('admin-password').value;

    if (!correo || !password) {
        alert("Completa todos los campos");
        return;
    }

    try {
        const respuesta = await fetch(`${API_URL_ADMIN}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ correo, password })
        });

        if (!respuesta.ok) {
            alert("Credenciales de administrador incorrectas");
            return;
        }

        const admin = await respuesta.json();
        localStorage.setItem('administradorLogueado', JSON.stringify(admin));
        window.location.href = "admin_dashboard.html";

    } catch (error) {
        console.error('Error:', error);
        alert('Error conectando con el servidor');
    }
}
