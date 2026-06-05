const LOCAL_API_BASE = 'http://localhost:8080/api';
const REMOTE_API_BASE = 'https://backend-book-648962643591.southamerica-east1.run.app/api';
const API_BASE = (window.location.protocol === 'file:' || window.location.hostname === '' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? LOCAL_API_BASE
    : REMOTE_API_BASE;
const API_URL = `${API_BASE}/libros`;

let calificacionSeleccionada = 0;
let lecturaEnProceso = null;

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
        console.error('Error obteniendo portada:', error);
        return 'https://via.placeholder.com/120x180?text=Error';
    }
}

function initRatingStars() {
    const stars = document.querySelectorAll('#star-rating .star');
    const calificacionInput = document.getElementById('calificacion');

    stars.forEach(star => {
        const value = parseInt(star.dataset.value, 10);

        star.addEventListener('click', () => {
            calificacionSeleccionada = value;
            if (calificacionInput) calificacionInput.value = value;
            updateStarDisplay(value);
        });

        star.addEventListener('mouseover', () => updateStarDisplay(value));
        star.addEventListener('mouseout', () => updateStarDisplay(calificacionSeleccionada));
    });
}

function updateStarDisplay(value) {
    const stars = document.querySelectorAll('#star-rating .star');
    stars.forEach(star => {
        const starValue = parseInt(star.dataset.value, 10);
        star.style.color = starValue <= value ? '#ffd700' : '#ccc';
    });
}

async function cargarLecturaActual() {
    try {
        const respuesta = await fetch(`${API_URL}/actual`);
        if (!respuesta.ok) return;

        const text = await respuesta.text();
        if (!text.trim()) return;

        const libro = JSON.parse(text);
        if (libro && libro.id) {
            lecturaEnProceso = libro;
            lecturaEnProceso.portada = await obtenerPortada(libro.titulo);
            mostrarTarjetaProgreso();
        }
    } catch (error) {
        console.error('Error cargando lectura actual:', error);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    initRatingStars();

    const califInput = document.getElementById('calificacion');
    if (califInput) califInput.value = 0;

    cargarLecturaActual();

    const inputTitulo = document.getElementById('titulo');
    if (inputTitulo) {
        inputTitulo.addEventListener('input', async () => {
            const titulo = inputTitulo.value;
            const img = document.getElementById('previewPortada');

            if (titulo.trim() === '') {
                if (img) img.src = '';
                return;
            }

            try {
                const url = await obtenerPortada(titulo);
                if (img) img.src = url;
            } catch (err) {
                console.error('Error en la carga:', err);
            }
        });
    }
});

async function Guardar_libro() {
    const nuevoLibro = {
        titulo: document.getElementById('titulo').value,
        autor: document.getElementById('autor').value,
        genero: document.getElementById('genero').value,
        resena: document.getElementById('resena').value,
        inicio: document.getElementById('inicio').value || null,
        fin: document.getElementById('final').value || null,
        calificacion: parseInt(document.getElementById('calificacion').value) || 0
    };

    if (nuevoLibro.titulo.trim() === '') {
        alert('Por favor, ingresa al menos el título del libro.');
        return;
    }

    try {
        const respuesta = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(nuevoLibro)
        });

        if (respuesta.ok) {
            alert('Libro guardado correctamente en la API');
            window.location.href = 'libros_leidos.html';
        } else {
            alert('Error al guardar en la API');
        }
    } catch (error) {
        console.error('Error conectando con la API:', error);
        alert('Error al guardar el libro.');
    }
}

function validarFormulario() {
    const titulo = document.getElementById('titulo').value.trim();
    const autor = document.getElementById('autor').value.trim();

    if (!titulo) {
        alert('Por favor ingresa el título del libro.');
        return false;
    }
    if (!autor) {
        alert('Por favor ingresa el autor del libro.');
        return false;
    }
    return true;
}

async function guardarLecturaEnDB() {
    if (!validarFormulario()) return false;

    const libroPayload = {
        titulo: document.getElementById('titulo').value,
        autor: document.getElementById('autor').value,
        genero: document.getElementById('genero').value,
        resena: document.getElementById('resena').value,
        inicio: document.getElementById('inicio').value || null,
        fin: document.getElementById('final').value || null,
        calificacion: parseInt(document.getElementById('calificacion').value) || 0
    };

    try {
        const url = lecturaEnProceso && lecturaEnProceso.id ? `${API_URL}/${lecturaEnProceso.id}` : API_URL;
        const method = lecturaEnProceso && lecturaEnProceso.id ? 'PUT' : 'POST';

        const respuesta = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(libroPayload)
        });

        if (!respuesta.ok) {
            throw new Error('No se pudo guardar el progreso');
        }

        lecturaEnProceso = await respuesta.json();
        lecturaEnProceso.portada = document.getElementById('previewPortada').src || await obtenerPortada(lecturaEnProceso.titulo);
        mostrarTarjetaProgreso();
        return true;
    } catch (error) {
        console.error('Error guardando lectura en la API:', error);
        alert('Error al guardar el progreso. Revisa la conexión con la API.');
        return false;
    }
}

async function Guardar_progreso() {
    const guardado = await guardarLecturaEnDB();
    if (guardado) {
        alert('Progreso guardado');
    }
}

async function Guardar_cambios() {
    const guardado = await guardarLecturaEnDB();
    if (guardado) {
        alert('Cambios guardados correctamente');
    }
}

function mostrarTarjetaProgreso() {
    if (!lecturaEnProceso) return;

    const container = document.getElementById('progresoGuardadoContainer');
    const estrellas = Array.from({ length: 5 }, (_, index) => `
            <span style="color:${index + 1 <= lecturaEnProceso.calificacion ? '#ffd700' : '#ccc'}">★</span>`
        ).join('');

    container.innerHTML = `
        <div class="libro-card">
            <h2 class="libro-titulo">${lecturaEnProceso.titulo}</h2>
            <div class="libro-info">
                <img
                    src="${lecturaEnProceso.portada || 'https://via.placeholder.com/120x180?text=Sin+portada'}"
                    class="libro-portada"
                    alt="Portada">
                <div class="libro-detalles">
                    <p><strong>Autor:</strong> ${lecturaEnProceso.autor || 'Sin registrar'}</p>
                    <p><strong>Género:</strong> ${lecturaEnProceso.genero || 'Sin registrar'}</p>
                    <p><strong>Inicio:</strong> ${lecturaEnProceso.inicio || 'Sin registrar'}</p>
                    <p><strong>Reseña:</strong> ${lecturaEnProceso.resena || 'Sin registrar'}</p>
                    <p><strong>Calificación:</strong> ${estrellas}</p>
                    <button type="button" onclick="editarLectura()">Editar lectura</button>
                </div>
            </div>
        </div>`;
}

async function editarLectura() {
    if (!lecturaEnProceso) return;

    document.getElementById('titulo').value = lecturaEnProceso.titulo || '';
    document.getElementById('autor').value = lecturaEnProceso.autor || '';
    document.getElementById('genero').value = lecturaEnProceso.genero || '';
    document.getElementById('resena').value = lecturaEnProceso.resena || '';
    document.getElementById('inicio').value = lecturaEnProceso.inicio || '';
    document.getElementById('final').value = lecturaEnProceso.fin || '';
    document.getElementById('calificacion').value = lecturaEnProceso.calificacion || 0;
    calificacionSeleccionada = parseInt(lecturaEnProceso.calificacion) || 0;
    updateStarDisplay(calificacionSeleccionada);

    const preview = document.getElementById('previewPortada');
    if (preview) {
        preview.src = lecturaEnProceso.portada || await obtenerPortada(lecturaEnProceso.titulo);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}
