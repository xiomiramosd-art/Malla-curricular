// Se ejecuta cuando todo el contenido del HTML ha sido cargado
document.addEventListener('DOMContentLoaded', () => {

    // --- SELECCIÓN DE ELEMENTOS ---
    const todosLosRamos = document.querySelectorAll('.ramo');
    // IDs de todos los ramos hasta el octavo semestre para el requisito especial del internado
    const ramosHastaOctavo = [
        'fundamentos-enfermeria', 'quimica', 'anatomia', 'biologia-celular', 'transversal-1',
        'cuidados-basicos', 'bioquimica', 'embriologia', 'microbiologia', 'transversal-2',
        'proceso-cuidados-1', 'farmacologia', 'fisiologia', 'salud-publica', 'bioestadistica', 'ingles-1',
        'proceso-cuidados-2', 'gestion-salud', 'farmacologia-aplicada', 'fisiopatologia', 'enfermeria-comunitaria-1', 'sello-institucional',
        'interdisciplinar-as', 'enfermeria-mujer', 'gestion-servicios-1',
        'enfermeria-comunitaria-2', 'enfermeria-medico-quirurgico', 'enfermeria-gerontologia',
        'enfermeria-salud-mental-1', 'investigacion-enfermeria-1', 'electivo-1',
        'enfermeria-pediatria', 'enfermeria-comunitaria-3', 'enfermeria-urgencia',
        'enfermeria-salud-mental-2', 'investigacion-enfermeria-2', 'electivo-2'
    ];

    // --- ESTADO DE LA APLICACIÓN ---
    // Carga los ramos aprobados desde localStorage. Si no hay nada, empieza con un Set vacío.
    // Usamos un Set para un manejo más eficiente de los IDs (no permite duplicados).
    let ramosAprobados = new Set(JSON.parse(localStorage.getItem('ramosAprobados')) || []);

    // --- FUNCIONES ---

    /**
     * Guarda el conjunto de ramos aprobados en el localStorage del navegador.
     */
    const guardarProgreso = () => {
        // localStorage solo guarda strings, así que convertimos el Set a Array y luego a JSON.
        localStorage.setItem('ramosAprobados', JSON.stringify(Array.from(ramosAprobados)));
    };

    /**
     * Obtiene el nombre legible de un ramo a partir de su ID.
     * @param {string} id - El ID del ramo (ej. 'calculo-1').
     * @returns {string} El nombre del ramo.
     */
    const getNombreRamoPorId = (id) => {
        const elementoRamo = document.getElementById(id);
        return elementoRamo ? elementoRamo.textContent : '';
    };

    /**
     * Actualiza la apariencia de todos los ramos según su estado (normal, aprobado, bloqueado).
     */
    const actualizarVistaRamos = () => {
        todosLosRamos.forEach(ramo => {
            const idRamo = ramo.id;
            const requisitos = ramo.dataset.requisitos?.split(',') || [];

            // Limpiar clases de estado previas
            ramo.classList.remove('aprobado', 'bloqueado');

            // 1. Marcar como APROBADO si está en nuestro Set
            if (ramosAprobados.has(idRamo)) {
                ramo.classList.add('aprobado');
                return; // Si está aprobado, no puede estar bloqueado.
            }

            // 2. Comprobar si está BLOQUEADO
            let bloqueado = false;
            // Caso especial para internados
            if (requisitos[0] === 'hasta-octavo') {
                // Comprueba si TODOS los ramos hasta el octavo semestre están aprobados
                if (!ramosHastaOctavo.every(reqId => ramosAprobados.has(reqId))) {
                    bloqueado = true;
                }
            } else { // Caso normal para otros ramos
                // Comprueba si ALGÚN requisito NO está en la lista de aprobados
                if (requisitos.some(reqId => reqId && !ramosAprobados.has(reqId))) {
                    bloqueado = true;
                }
            }
            
            if (bloqueado) {
                ramo.classList.add('bloqueado');
            }
        });
    };

    /**
     * Maneja el evento de clic en un ramo.
     * @param {MouseEvent} event - El objeto del evento de clic.
     */
    const handleRamoClick = (event) => {
        const ramo = event.currentTarget;
        const idRamo = ramo.id;
        
        // Si el ramo está bloqueado, muestra una alerta y no hagas nada más.
        if (ramo.classList.contains('bloqueado')) {
            const requisitos = ramo.dataset.requisitos?.split(',') || [];
            let requisitosFaltantes = [];

            if (requisitos[0] === 'hasta-octavo') {
                requisitosFaltantes = ramosHastaOctavo.filter(reqId => !ramosAprobados.has(reqId));
            } else {
                requisitosFaltantes = requisitos.filter(reqId => reqId && !ramosAprobados.has(reqId));
            }

            const nombresFaltantes = requisitosFaltantes.map(getNombreRamoPorId).join('\n- ');
            alert(`Para tomar este ramo, primero debes aprobar:\n- ${nombresFaltantes}`);
            return;
        }

        // Si el ramo no está bloqueado, cambia su estado (aprobar/desaprobar).
        if (ramosAprobados.has(idRamo)) {
            ramosAprobados.delete(idRamo); // Desaprobar
        } else {
            ramosAprobados.add(idRamo); // Aprobar
        }

        // Guardar el nuevo estado y actualizar la vista
        guardarProgreso();
        actualizarVistaRamos();
    };

    // --- INICIALIZACIÓN ---

    // Añade el detector de eventos de clic a cada ramo.
    todosLosRamos.forEach(ramo => {
        ramo.addEventListener('click', handleRamoClick);
    });

    // Llama a esta función una vez al cargar la página para establecer el estado inicial.
    actualizarVistaRamos();
});

