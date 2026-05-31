const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:8080/api'
    : 'https://backend-book-648962643591.southamerica-east1.run.app/api';
const API_URL = `${API_BASE}/libros/leidos`;

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

function irlectura_actual() { window.location.href = "lectura_actual.html"; }
function irlibros_leidos() { window.location.href = "libros_leidos.html"; }
function irlista_deseos() { window.location.href = "lista_deseos.html"; }
function irperfil() { window.location.href = "perfil.html"; }
function irlogin() { window.location.href = "login.html"; }

document.addEventListener('DOMContentLoaded', () => {
    cargarHistorial();
});

async function buscarLibros() {
    const texto = document.getElementById('busqueda').value;
    const contenedor = document.getElementById('historial-libros');
    contenedor.innerHTML = "";

    if (!texto) {
        cargarHistorial();
        return;
    }

    try {
        const respuesta = await fetch(`${API_BASE}/libros/buscar?texto=${encodeURIComponent(texto)}`);

        if (!respuesta.ok) throw new Error();

        const libros = await respuesta.json();

        if (libros.length === 0) {
            contenedor.innerHTML = "<p>No se encontraron resultados</p>";
            return;
        }

        const completados = libros.filter(libro => libro.fin && libro.fin.trim() !== "");
        
        if (completados.length === 0) {
            contenedor.innerHTML = "<p>No se encontraron resultados en libros finalizados</p>";
            return;
        }

        for (const libro of completados) {
            await renderizarTarjeta(libro);
        }

    } catch (error) {
        console.error("Error en búsqueda", error);
    }
}

async function cargarHistorial() {
    const contenedor = document.getElementById('historial-libros');
    contenedor.innerHTML = "";

    try {
        const respuesta = await fetch(API_URL);

        if (!respuesta.ok) {
            throw new Error("Error al obtener datos");
        }

        const libros = await respuesta.json();

        if (libros.length === 0) {
            contenedor.innerHTML = `
                <div style="text-align:center; padding:50px;">
                    <p>No hay libros leídos aún</p>
                </div>`;
            return;
        }

        for (const libro of libros) {
            await renderizarTarjeta(libro);
        }

    } catch (error) {
        console.error("Error conectando con la API:", error);
        contenedor.innerHTML = `<p>Error cargando datos</p>`;
    }
}

async function renderizarTarjeta(libro) {
    const contenedor = document.getElementById('historial-libros');
    const tarjeta = document.createElement('div');
    tarjeta.className = 'libro-card';
    tarjeta.id = `libro-${libro.id}`;

    let estrellasHTML = '';
    const calif = parseInt(libro.calificacion) || 0;

    for (let i = 1; i <= 5; i++) {
        estrellasHTML += `
            <span style="color:${i <= calif ? '#ffd700' : '#ccc'};">
                ★
            </span>`;
    }

    const portadaUrl = await obtenerPortada(libro.titulo);

    tarjeta.innerHTML = `
        <h2 class="libro-titulo">${libro.titulo}</h2>
        <img src="${portadaUrl}" style="margin-top:10px; width:150px; height:220px; object-fit:cover; border-radius:10px;">
        <p class="libro-autor"><strong>Autor:</strong> ${libro.autor || 'Desconocido'}</p>
        <p class="libro-genero"><strong>Género:</strong> ${libro.genero || 'N/A'}</p>
        <p class="libro-fechas"><strong>Fechas:</strong> ${libro.inicio} - ${libro.fin}</p>
        <p class="libro-resena"><strong>Reseña:</strong> ${libro.resena || 'Sin reseña'}</p>
        <div class="libro-calificacion"><strong>Calificación:</strong> <div class="stars-display">${estrellasHTML}</div></div>
        <button onclick="eliminarLibro(${libro.id})" style="margin-top:15px; background-color:#79876D;">Eliminar</button>
    `;

    contenedor.appendChild(tarjeta);
}

async function eliminarLibro(id) {
    if (!confirm("¿Eliminar este libro?")) return;

    try {
        const respuesta = await fetch(`${API_BASE}/libros/${id}`, {
            method: 'DELETE'
        });

        if (respuesta.ok) {
            alert("Libro eliminado correctamente");
            cargarHistorial();
        } else {
            alert("No se pudo eliminar");
        }

    } catch (error) {
        console.error("Error eliminando:", error);
    }
}