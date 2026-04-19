const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:8080/api'
    : 'https://https://backend-book-648962643591.southamerica-east1.run.app/api';
const API_URL = `${API_BASE}/usuarios`;
const usuario = JSON.parse(localStorage.getItem("usuarioLogueado"));

function irARegistro() { 
    window.location.href = "registro.html"; 
}

function irHome() { 
    window.location.href = "lectura_actual.html"; 
}

async function login() {
    const correo = document.getElementById('user').value;
    const password = document.getElementById('pass').value;

    if (!correo || !password) {
        alert("Completa todos los campos");
        return;
    }

    try {
        const respuesta = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ correo, password })
        });

        if (!respuesta.ok) {
            alert("Credenciales incorrectas");
            return;
        }

        const usuario = await respuesta.json();

        if (usuario) {
            localStorage.setItem("usuarioLogueado", JSON.stringify(usuario));

            alert("Login exitoso 🎉");
            irHome();
        } else {
            alert("Credenciales incorrectas");
        }

    } catch (error) {
        console.error("Error:", error);
        alert("Error conectando con el servidor");
    }
}