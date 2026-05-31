const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:8080/api'
    : 'https://backend-book-648962643591.southamerica-east1.run.app/api';
const API_URL = `${API_BASE}/libros`;

let calificacionSeleccionada = 0;

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
    const califInput = document.getElementById('calificacion');
    if(califInput) califInput.value = 0;

    const inputTitulo = document.getElementById('titulo');
    if (inputTitulo) {
        inputTitulo.addEventListener('input', async () => {
            const titulo = inputTitulo.value;
            const img = document.getElementById('previewPortada');

            if (titulo.trim() === "") {
                if(img) img.src = "";
                return;
            }

            try {
                const url = await obtenerPortada(titulo);
                if(img) img.src = url;
            } catch (err) {
                console.error("Error en la carga:", err);
            }
        });
    }

    // Cambios: Cargar las lecturas actuales en proceso e inyectar el nuevo botón
    cargarLecturasEnProceso();
    inyectarBotonProgreso();
});

// Inyecta el botón para guardar el avance en progreso sin salir de la página
function inyectarBotonProgreso() {
    const contenedorForm = document.querySelector('.form-content');
    const botonTerminar = document.querySelector('.boton_terminar_lectura');
    
    if (contenedorForm && botonTerminar && !document.getElementById('btnGuardarProceso')) {
        const botonProceso = document.createElement('button');
        botonProceso.type = 'button';
        botonProceso.id = 'btnGuardarProceso';
        botonProceso.className = 'boton-guardar-proceso';
        botonProceso.style.backgroundColor = '#6b7760';
        botonProceso.style.marginBottom = '10px';
        botonProceso.innerText = 'Guardar lectura en proceso';
        
        botonProceso.onclick = () => Guardar_libro(false); // false significa que no está terminado
        
        contenedorForm.insertBefore(botonProceso, botonTerminar);
    }
}

// Carga y filtra dinámicamente los libros que no tienen fecha de fin
async function cargarLecturasEnProceso() {
    const contenedor = document.getElementById('lista-proceso');
    if (!contenedor) return;
    contenedor.innerHTML = "";

    try {
        const respuesta = await fetch(API_URL);
        if (!respuesta.ok) throw new Error("Error recuperando lecturas.");

        const libros = await respuesta.json();

        const librosEnProceso = libros.filter(libro => !libro.fin || libro.fin.trim() === "");

        if (librosEnProceso.length === 0) {
            contenedor.innerHTML = "<p style='font-family: \"Patrick Hand\", cursive; font-size: 1.3rem; color: #555;'>No tienes lecturas en proceso actualmente.</p>";
            return;
        }

        for (const libro of librosEnProceso) {
            const tarjeta = document.createElement('div');
            tarjeta.className = 'libro-card';
            tarjeta.style.marginTop = '15px';
            
            const portadaUrl = await obtenerPortada(libro.titulo);

            let estrellasHTML = '';
            const calif = parseInt(libro.calificacion) || 0;
            for (let i = 1; i <= 5; i++) {
                estrellasHTML += `<span style="color:${i <= calif ? '#ffd700' : '#ccc'};">★</span>`;
            }

            tarjeta.innerHTML = `
                <h2 class="libro-titulo">${libro.titulo}</h2>
                <img src="${portadaUrl}" style="margin-top:10px; width:120px; height:180px; object-fit:cover; border-radius:10px;">
                <p class="libro-autor"><strong>Autor:</strong> ${libro.autor || 'Desconocido'}</p>
                <p class="libro-genero"><strong>Género:</strong> ${libro.genero || 'N/A'}</p>
                <p class="libro-fechas"><strong>Inicio:</strong> ${libro.inicio || 'No definida'}</p>
                <div style="margin-bottom: 15px;"><strong>Calificación temporal:</strong> ${estrellasHTML}</div>
                <button type="button" class="btn-editar-proceso" style="background-color: #a3b899; color: white;" id="edit-btn-${libro.id}">Editar / Terminar lectura</button>
            `;
            
            contenedor.appendChild(tarjeta);

            document.getElementById(`edit-btn-${libro.id}`).addEventListener('click', () => {
                cargarLibroParaEditar(libro);
            });
        }
    } catch (error) {
        console.error("Error al cargar lecturas en proceso:", error);
        contenedor.innerHTML = "<p>Error al conectar con el servidor.</p>";
    }
}

function cargarLibroParaEditar(libro) {
    document.getElementById('libroId').value = libro.id;
    document.getElementById('titulo').value = libro.titulo;
    document.getElementById('autor').value = libro.autor || '';
    document.getElementById('genero').value = libro.genero || '';
    document.getElementById('resena').value = libro.resena || '';
    document.getElementById('inicio').value = libro.inicio || '';
    document.getElementById('final').value = libro.fin || '';
    
    const calificacion = libro.calificacion || 0;
    document.getElementById('calificacion').value = calificacion;
    updateStarDisplay(calificacion);
    calificacionSeleccionada = calificacion;

    const img = document.getElementById('previewPortada');
    if (img && libro.titulo) {
        obtenerPortada(libro.titulo).then(url => img.src = url);
    }
    
    document.querySelector('.reg-form-container').scrollIntoView({ behavior: 'smooth' });
}

async function Guardar_libro(esFinalizado = true) {
    const idExistente = document.getElementById('libroId').value;
    
    const nuevoLibro = {
        titulo: document.getElementById('titulo').value,
        autor: document.getElementById('autor').value,
        genero: document.getElementById('genero').value,
        resena: document.getElementById('resena').value,
        inicio: document.getElementById('inicio').value,
        fin: esFinalizado ? document.getElementById('final').value : "", 
        calificacion: parseInt(document.getElementById('calificacion').value) || 0
    };

    if (nuevoLibro.titulo.trim() === "") {
        alert("Por favor, ingresa al menos el título del libro.");
        return;
    }
    
    if (esFinalizado && nuevoLibro.fin.trim() === "") {
        alert("Para finalizar la lectura es obligatorio registrar la fecha de fin.");
        return;
    }

    try {
        const urlPeticion = idExistente ? `${API_BASE}/libros/${idExistente}` : API_URL;
        const metodoHTTP = idExistente ? 'PUT' : 'POST';

        const respuesta = await fetch(urlPeticion, {
            method: metodoHTTP,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(nuevoLibro)
        });

        if (respuesta.ok) {
            if (esFinalizado) {
                alert("¡Felicitaciones! Has terminado el libro y se ha guardado en leídos.");
                window.location.href = "libros_leidos.html";
            } else {
                alert("Lectura guardada en proceso correctamente.");
                limpiarFormularioLectura();
                cargarLecturasEnProceso();
            }
        } else {
            alert("Error al intentar procesar la solicitud en el servidor.");
        }

    } catch (error) {
        console.error("Error conectando con la API:", error);
    }
}

function limpiarFormularioLectura() {
    document.getElementById('libroId').value = "";
    document.getElementById('titulo').value = "";
    document.getElementById('autor').value = "";
    document.getElementById('genero').value = "";
    document.getElementById('resena').value = "";
    document.getElementById('inicio').value = "";
    document.getElementById('final').value = "";
    document.getElementById('calificacion').value = 0;
    const img = document.getElementById('previewPortada');
    if (img) img.src = "";
    updateStarDisplay(0);
    calificacionSeleccionada = 0;
}