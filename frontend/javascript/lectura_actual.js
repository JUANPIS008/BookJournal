const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:8080/api'
    : 'https://backend-book-648962643591.southamerica-east1.run.app/api';
const API_URL = `${API_BASE}/libros`;

let calificacionSeleccionada = 0;

//se añadio la funcion obtenerPortada para obtener la imagen de portada de cada libro
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

function initRatingStars() {
    const stars = document.querySelectorAll('#star-rating .star');
    const calificacionInput = document.getElementById('calificacion');

    stars.forEach(star => {
        const value = parseInt(star.dataset.value, 10);

        star.addEventListener('click', () => {
            calificacionSeleccionada = value;
            calificacionInput.value = value;
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

window.addEventListener('DOMContentLoaded', () => {
    initRatingStars();
    document.getElementById('calificacion').value = 0;

    document.getElementById('titulo').addEventListener('input', async () => {
        const titulo = document.getElementById('titulo').value;
        const img = document.getElementById('previewPortada');

        if (titulo.trim() === "") {
            img.src = "";
            return;
        }

        const urlPortada = await obtenerPortada(titulo); 
        img.src = urlPortada;
    });
});

async function Guardar_libro() {

    const nuevoLibro = {
        titulo: document.getElementById('titulo').value,
        autor: document.getElementById('autor').value,
        genero: document.getElementById('genero').value,
        resena: document.getElementById('resena').value,
        inicio: document.getElementById('inicio').value,
        fin: document.getElementById('final').value,
        calificacion: parseInt(document.getElementById('calificacion').value) || 0
    };

    if (nuevoLibro.titulo.trim() === "") {
        alert("Por favor, ingresa al menos el título del libro.");
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
            alert("Libro guardado correctamente en la API");
            window.location.href = "libros_leidos.html";
        } else {
            alert("Error al guardar en la API");
        }

    } catch (error) {
        console.error("Error conectando con la API:", error);
    }
}

