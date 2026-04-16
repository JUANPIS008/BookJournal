

let calificacionSeleccionada = 0;

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