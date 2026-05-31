const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:8080/api'
    : 'https://backend-book-648962643591.southamerica-east1.run.app/api';
const API_URL = `${API_BASE}/deseos`;

function irlectura_actual() { window.location.href = "lectura_actual.html"; }
function irlibros_leidos() { window.location.href = "libros_leidos.html"; }
function irlista_deseos() { window.location.href = "lista_deseos.html"; }
function irperfil() { window.location.href = "perfil.html"; }
function irlogin() { window.location.href = "login.html"; }

document.addEventListener('DOMContentLoaded', () => {
    cargarDeseos();
});

async function obtenerPortada(titulo) {
    try {
        const res = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(titulo)}`);
        const data = await res.json();

        const libro = data.docs?.[0];

        if (!libro || !libro.cover_i) {
            return 'https://via.placeholder.com/120x180?text=Sin+portada';
        }

        return `https://covers.openlibrary.org/b/id/${libro.cover_i}-M.jpg`;

    } catch (error) {
        console.error("Error obteniendo portada:", error);
        return 'https://via.placeholder.com/120x180?text=Error';
    }
}

async function cargarDeseos() {
    const contenedor = document.getElementById('lista-deseos-container');
    if (!contenedor) return;

    contenedor.innerHTML = '';

    try {
        const respuesta = await fetch(API_URL);

        if (!respuesta.ok) throw new Error();

        const listaLibros = await respuesta.json();

        if (listaLibros.length === 0) {
            contenedor.innerHTML = `
                <p style="text-align:center;">
                    Aún no tienes libros en tu lista
                </p>`;
            return;
        }

        for (const libro of listaLibros) {
            await renderizarTarjeta(libro);
        }

    } catch (error) {
        console.error("Error cargando deseos:", error);
        contenedor.innerHTML = `<p>Error cargando datos</p>`;
    }
}

async function renderizarTarjeta(libro) {
    const contenedor = document.getElementById('lista-deseos-container');

    const tarjeta = document.createElement('div');
    tarjeta.className = 'libro-card';

    const portadaUrl = await obtenerPortada(libro.titulo);

    tarjeta.innerHTML = `
        <h2>${libro.titulo}</h2>

        <img src="${portadaUrl}"
             style="width:150px;
                    height:220px;
                    object-fit:cover;
                    border-radius:10px;
                    margin:15px 0;">

        <button onclick="eliminarDeseo(${libro.id})">
            Eliminar
        </button>
    `;

    contenedor.appendChild(tarjeta);
}

async function addWish() {
    const input = document.getElementById('wish-input');
    const titulo = input.value.trim();

    if (titulo === "") {
        alert("Escribe un libro");
        return;
    }

    try {
        await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ titulo })
        });

        input.value = "";
        cargarDeseos();

    } catch (error) {
        console.error("Error guardando:", error);
    }
}

async function agregarLibroDeseadoDirecto(titulo) {
    if (!titulo || titulo.trim() === "") return;

    try {
        const respuesta = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ titulo: titulo.trim() })
        });

        if (respuesta.ok) {
            alert("¡Libro agregado a tu lista de deseos!");
            if (document.getElementById('lista-deseos-container')) {
                cargarDeseos();
            }
        } else {
            alert("No se pudo agregar el libro.");
        }

    } catch (error) {
        console.error("Error guardando el libro recomendado:", error);
    }
}

async function eliminarDeseo(id) {
    if (!confirm("¿Eliminar este libro de tu lista?")) return;

    try {
        await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        cargarDeseos();

    } catch (error) {
        console.error("Error eliminando:", error);
    }
}