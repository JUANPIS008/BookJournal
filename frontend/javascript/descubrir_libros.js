const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:8080/api'
    : 'https://backend-book-648962643591.southamerica-east1.run.app/api';
const API_DESEOS = `${API_BASE}/deseos`;
const API_LEIDOS = `${API_BASE}/libros/leidos`;
const API_USUARIOS = `${API_BASE}/usuarios`;
const STORAGE_KEY = 'usuarioLogueado';

document.addEventListener('DOMContentLoaded', () => {
    generarRecomendacionesPersonalizadas();
});

async function generarRecomendacionesPersonalizadas() {
    const contenedor = document.getElementById('contenedor-recomendados');
    const loader = document.getElementById('loader-recomendaciones');
    
    if (!contenedor || !loader) return;

    try {
        const datosLocal = localStorage.getItem(STORAGE_KEY);
        if (!datosLocal) {
            loader.innerHTML = "Por favor, inicia sesión para recibir recomendaciones personalizadas.";
            return;
        }
        const usuarioLocal = JSON.parse(datosLocal);

        let generoFavorito = "";
        try {
            const respuestaUsuario = await fetch(`${API_USUARIOS}/${usuarioLocal.id}`);
            if (respuestaUsuario.ok) {
                const usuarioData = await respuestaUsuario.json();
                generoFavorito = usuarioData.generoFavorito || "";
            }
        } catch (errUsuario) {
            console.warn("No se pudo conectar al endpoint de usuarios, utilizando datos de respaldo local.", errUsuario);
            generoFavorito = usuarioLocal.generoFavorito || "";
        }

        let misDeseos = [];
        try {
            const respuestaDeseos = await fetch(API_DESEOS);
            if (respuestaDeseos.ok) misDeseos = await respuestaDeseos.json();
        } catch (errDeseos) {
            console.warn("Fallo al recuperar la lista de deseos.", errDeseos);
        }

        let misLeidos = [];
        try {
            const respuestaLeidos = await fetch(API_LEIDOS);
            if (respuestaLeidos.ok) misLeidos = await respuestaLeidos.json();
        } catch (errLeidos) {
            console.warn("Fallo al recuperar el historial de libros leídos.", errLeidos);
        }

        let bolsasDePalabras = [];
        
        if (generoFavorito && generoFavorito.trim() !== "") {
            bolsasDePalabras.push(generoFavorito.toLowerCase().trim());
        }

        misDeseos.forEach(libro => {
            const palabras = libro.titulo.toLowerCase()
                .replace(/[^a-zA-Záéíóúñ ]/g, "")
                .split(" ")
                .filter(p => p.length > 4);
            if (palabras.length > 0) {
                bolsasDePalabras.push(palabras[0]);
            }
        });

        misLeidos.forEach(libro => {
            if (libro.genero) {
                bolsasDePalabras.push(libro.genero.toLowerCase().trim());
            }
            const palabrasTitulo = libro.titulo.toLowerCase()
                .replace(/[^a-zA-Záéíóúñ ]/g, "")
                .split(" ")
                .filter(p => p.length > 4);
            if (palabrasTitulo.length > 0) {
                bolsasDePalabras.push(palabrasTitulo[0]);
            }
        });

        if (bolsasDePalabras.length === 0) {
            bolsasDePalabras.push('fiction', 'classic', 'fantasy', 'romance', 'history');
        }

        const criterioDeBusqueda = bolsasDePalabras[Math.floor(Math.random() * bolsasDePalabras.length)];
        
        const urlOpenLibrary = `https://openlibrary.org/search.json?q=${encodeURIComponent(criterioDeBusqueda)}&limit=15`;
        const resOL = await fetch(urlOpenLibrary);
        const dataOL = await resOL.json();
        
        loader.style.display = 'none';
        contenedor.innerHTML = '';

        if (!dataOL.docs || dataOL.docs.length === 0) {
            contenedor.innerHTML = "<p class='loader'>No encontramos recomendaciones para este criterio en este momento. ¡Agrega más libros a tu biblioteca!</p>";
            return;
        }

        const titulosExcluir = [
            ...misDeseos.map(d => d.titulo.toLowerCase().trim()),
            ...misLeidos.map(l => l.titulo.toLowerCase().trim())
        ];

        const librosFiltrados = dataOL.docs.filter(doc => !titulosExcluir.includes(doc.title.toLowerCase().trim()));

        if (librosFiltrados.length === 0) {
            contenedor.innerHTML = "<p class='loader'>¡Excelente! Ya guardaste o leíste todos los libros sugeridos para esta sección.</p>";
            return;
        }

        librosFiltrados.slice(0, 6).forEach(libro => {
            const tarjeta = document.createElement('div');
            tarjeta.className = 'tarjeta-recomendada';

            const portadaId = libro.cover_i;
            const urlPortada = portadaId 
                ? `https://covers.openlibrary.org/b/id/${portadaId}-M.jpg`
                : 'https://via.placeholder.com/120x180?text=Sin+portada';

            const autor = libro.author_name ? libro.author_name[0] : 'Autor Desconocido';
            const tituloLimpio = libro.title.replace(/'/g, "\\'").replace(/"/g, '&quot;');

            tarjeta.innerHTML = `
                <img src="${urlPortada}" style="width:110px; height:160px; object-fit:cover; border-radius:8px; box-shadow: 0 2px 6px rgba(0,0,0,0.15);">
                <h3>${libro.title}</h3>
                <p style="margin: 5px 0 15px 0; color: #555; font-size: 1.1rem;"><strong>Por:</strong> ${autor}</p>
                <button class="btn-agregar-recomendado" onclick="agregarDesdeRecomendados('${tituloLimpio}')">Agregar a mi lista</button>
            `;
            contenedor.appendChild(tarjeta);
        });

    } catch (error) {
        console.error("Error procesando recomendaciones:", error);
        loader.innerHTML = "Ocurrió un inconveniente técnico al sincronizar tus recomendaciones literarias.";
    }
}

async function agregarDesdeRecomendados(tituloLibro) {
    try {
        const respuesta = await fetch(API_DESEOS, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ titulo: tituloLibro })
        });

        if (respuesta.ok) {
            alert(`"${tituloLibro}" se agregó correctamente a tu lista de deseos`);
            generarRecomendacionesPersonalizadas();
        } else {
            alert("No se pudo procesar el guardado del libro seleccionado.");
        }
    } catch (error) {
        console.error("Error al registrar desde recomendados:", error);
        alert("Error crítico de comunicación por red.");
    }
}

//FUNCION PREMIUM
async function agregarDesdeRecomendados(tituloLibro) {
    try {
        const datosLocal = localStorage.getItem(STORAGE_KEY);
        if (!datosLocal) {
            alert("Por favor, inicia sesión para realizar esta acción.");
            return;
        }
        const usuarioLocal = JSON.parse(datosLocal);
        
        const premiumStorageKey = `premium_${usuarioLocal.id}`;
        const esPremium = localStorage.getItem(premiumStorageKey);

        if (!esPremium) {
            const correoUsuario = usuarioLocal.correo || "tu correo registrado";
            abrirPasarelaPagoSimulada(correoUsuario, premiumStorageKey, tituloLibro);
            return;
        }

        await procesarGuardadoLibro(tituloLibro);

    } catch (error) {
        console.error("Error al procesar la verificación premium:", error);
        alert("Error crítico de comunicación por red.");
    }
}

async function procesarGuardadoLibro(tituloLibro) {
    const respuesta = await fetch(API_DESEOS, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ titulo: tituloLibro })
    });

    if (respuesta.ok) {
        alert(`"${tituloLibro}" se agregó correctamente a tu lista de deseos`);
        generarRecomendacionesPersonalizadas();
    } else {
        alert("No se pudo procesar el guardado del libro seleccionado.");
    }
}

function abrirPasarelaPagoSimulada(correo, storageKey, tituloLibro) {
    const mensajeCobro = `Función Premium de Descubrimiento\n\n` +
                         `Para agregar libros desde las recomendaciones personalizadas debes activar la suscripción.\n` +
                         `Valor del servicio: $10.000 COP\n\n` +
                         `Al aceptar, se enviará una factura detallada al correo electrónico: ${correo}.\n`;

    if (confirm(mensajeCobro)) {

        alert(`Se ha generado y enviado la factura de cobro por $10.000 COP a la dirección: ${correo}.\n\n` +
              `Gracias por activar tu versión Premium, ahora puedes agregar tus libros deseados.`);
        
        localStorage.setItem(storageKey, "true");
        
        procesarGuardadoLibro(tituloLibro);
    } else {
        alert("Proceso de suscripción cancelado. No se pudo agregar el libro.");
    }
}