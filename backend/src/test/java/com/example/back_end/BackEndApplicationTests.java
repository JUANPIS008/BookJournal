package com.example.back_end;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")

// @SpringBootTest
class BackEndApplicationTests {

	    @Autowired
    private MockMvc mockMvc;

    @Test
    public void testGuardarLibroIntegracion() throws Exception {
        // Simulamos los datos de un libro para la prueba
        String libroJson = "{\"titulo\":\"La casa de los espiritus\",\"autor\":\"Isabel Allende\",\"genero\":\"Ficcion\",\"calificacion\":5}";

        // Probamos el endpoint de tu backend
        mockMvc.perform(post("/api/libros")
                .contentType(MediaType.APPLICATION_JSON)
                .content(libroJson))
                .andExpect(status().isCreated());
    }
	
}
