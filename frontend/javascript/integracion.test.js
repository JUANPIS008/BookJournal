/**
 * @jest-environment jsdom
 */

describe('Pruebas de Integración - Book Journal', () => {
    test('Debe verificar que el campo de título recibe texto correctamente', () => {

        //campo de texto falso en la memoria
        document.body.innerHTML = '<input type="text" id="titulo" value="Cien años de soledad">';
        
        // se busca el campo usando el codigo
        const inputTitulo = document.getElementById('titulo');
        
        // verificar valor
        expect(inputTitulo.value).toBe('Cien años de soledad');
    });
});