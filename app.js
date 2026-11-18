const STORAGE_KEY = 'mis_tareas_app_v1';

/**
 * Estado global de la aplicación
 */
let tasks = [];
let currentFilter = 'all'; // 'all' | 'pending' | 'completed'
let toastTimeout = null;

// Referencias a elementos del DOM
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');
const emptyState = document.getElementById('empty-state');
const emptyTitle = document.getElementById('empty-title');
const emptySubtitle = document.getElementById('empty-subtitle');
const pendingCounter = document.getElementById('pending-counter');
const clearCompletedBtn = document.getElementById('clear-completed-btn');
const filterButtons = document.querySelectorAll('.filter-btn');
const toastMessage = document.getElementById('toast-message');
const toastText = document.getElementById('toast-text');
const currentDateEl = document.getElementById('current-date');

/**
 * Muestra la fecha actual formateada en español en el encabezado
 */
function renderCurrentDate() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    currentDateEl.textContent = new Date().toLocaleDateString('es-ES', options);
}

/**
 * Muestra un mensaje temporal de validación en pantalla
 * @param {string} message - Texto a mostrar
 */
function showToast(message) {
    toastText.textContent = message;
    toastMessage.classList.remove('hidden');
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toastMessage.classList.add('hidden');
    }, 3000);
}

/**
 * Guarda el arreglo actual de tareas en localStorage
 */
function saveTasksToStorage() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
        console.error('Error al guardar en localStorage:', error);
    }
}

/**
 * Carga las tareas guardadas desde localStorage
 */
function loadTasksFromStorage() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        tasks = stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Error al leer localStorage:', error);
        tasks = [];
    }
}

/**
 * Agrega una nueva tarea a la lista
 * @param {string} text - Descripción de la tarea
 */
function addTask(text) {
    const trimmed = text.trim();
    if (!trimmed) {
        showToast('Por favor, escribe una tarea válida.');
        taskInput.focus();
        return;
    }

    const newTask = {
        id: Date.now().toString(),
        text: trimmed,
        completed: false,
        createdAt: new Date().toISOString()
    };

    tasks.unshift(newTask);
    taskInput.value = '';
    toastMessage.classList.add('hidden');
    saveTasksToStorage();
    renderTasks();
}

/**
 * Alterna el estado completado/pendiente de una tarea
 * @param {string} id - Identificador único de la tarea
 */
function toggleTask(id) {
    tasks = tasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
    );
    saveTasksToStorage();
    renderTasks();
}

/**
 * Elimina una tarea individual por su ID
 * @param {string} id - Identificador único de la tarea
 */
function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasksToStorage();
    renderTasks();
}

/**
 * Elimina todas las tareas marcadas como completadas
 */
function clearCompletedTasks() {
    tasks = tasks.filter(task => !task.completed);
    saveTasksToStorage();
    renderTasks();
}

/**
 * Actualiza el contador de tareas pendientes y la visibilidad del botón de limpieza
 */
function updateStats() {
    const completed = tasks.filter(t => t.completed).length;
    const pending = tasks.length - completed;

    pendingCounter.textContent = pending === 1 ? '1 pendiente' : `${pending} pendientes`;

    // Mostrar u ocultar botón de "Limpiar completadas"
    if (completed > 0) {
        clearCompletedBtn.classList.remove('hidden');
    } else {
        clearCompletedBtn.classList.add('hidden');
    }
}

/**
 * Escapa caracteres HTML para evitar inyección de código (XSS)
 * @param {string} str - Cadena de texto ingresada por el usuario
 * @returns {string} Cadena segura
 */
function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/**
 * Cambia el filtro activo y actualiza estilos visuales de las pestañas
 * @param {string} filter - 'all' | 'pending' | 'completed'
 */
function setFilter(filter) {
    currentFilter = filter;
    filterButtons.forEach(btn => {
        if (btn.dataset.filter === filter) {
            btn.classList.add('active', 'bg-white', 'text-red-600', 'shadow-sm');
            btn.classList.remove('text-slate-600', 'hover:text-slate-900');
        } else {
            btn.classList.remove('active', 'bg-white', 'text-red-600', 'shadow-sm');
            btn.classList.add('text-slate-600', 'hover:text-slate-900');
        }
    });
    renderTasks();
}

/**
 * Renderiza la lista de tareas filtradas y gestiona el estado vacío
 */
function renderTasks() {
    updateStats();

    const filteredTasks = tasks.filter(task => {
        if (currentFilter === 'pending') return !task.completed;
        if (currentFilter === 'completed') return task.completed;
        return true;
    });

    taskList.innerHTML = '';

    if (filteredTasks.length === 0) {
        emptyState.classList.remove('hidden');
        if (currentFilter === 'completed') {
            emptyTitle.textContent = 'No hay tareas completadas';
            emptySubtitle.textContent = 'Completa alguna tarea para verla aquí.';
        } else if (currentFilter === 'pending' && tasks.length > 0) {
            emptyTitle.textContent = '¡Todo al día!';
            emptySubtitle.textContent = 'No tienes tareas pendientes por ahora.';
        } else {
            emptyTitle.textContent = 'No hay tareas pendientes';
            emptySubtitle.textContent = 'Agrega una nueva tarea arriba para comenzar tu día.';
        }
        return;
    }

    emptyState.classList.add('hidden');

    // Crear elementos DOM para cada tarea filtrada
    filteredTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `group flex items-center justify-between gap-3 p-3.5 rounded-xl border transition-all duration-200 ${
            task.completed 
                ? 'bg-slate-50/80 border-slate-100' 
                : 'bg-white border-slate-200 hover:border-red-300 hover:shadow-sm'
        }`;

        li.innerHTML = `
            <label class="flex items-center gap-3.5 flex-grow cursor-pointer select-none min-w-0">
                <div class="relative flex items-center justify-center shrink-0">
                    <input 
                        type="checkbox" 
                        ${task.completed ? 'checked' : ''} 
                        data-id="${task.id}"
                        class="task-checkbox peer sr-only"
                    >
                    <div class="w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                        task.completed 
                            ? 'bg-red-600 border-red-600 text-white' 
                            : 'border-slate-300 bg-white group-hover:border-red-400'
                    }">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 transition-transform ${task.completed ? 'scale-100' : 'scale-0'}" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                        </svg>
                    </div>
                </div>
                <span class="text-sm sm:text-base break-words transition-all ${
                    task.completed 
                        ? 'line-through text-slate-400' 
                        : 'text-slate-700 font-medium'
                }">
                    ${escapeHTML(task.text)}
                </span>
            </label>

            <button 
                type="button" 
                data-id="${task.id}"
                aria-label="Eliminar tarea"
                title="Eliminar tarea"
                class="delete-btn p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 shrink-0 cursor-pointer"
            >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
            </button>
        `;

        taskList.appendChild(li);
    });
}

// --- Eventos ---

// Envío del formulario para agregar tarea
taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    addTask(taskInput.value);
});

// Delegación de eventos en la lista (marcar como completada y eliminar)
taskList.addEventListener('change', (e) => {
    if (e.target.classList.contains('task-checkbox')) {
        toggleTask(e.target.dataset.id);
    }
});

taskList.addEventListener('click', (e) => {
    const deleteBtn = e.target.closest('.delete-btn');
    if (deleteBtn) {
        deleteTask(deleteBtn.dataset.id);
    }
});

// Eventos para botones de filtro
filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        setFilter(btn.dataset.filter);
    });
});

// Evento para limpiar tareas completadas
clearCompletedBtn.addEventListener('click', clearCompletedTasks);

// Inicialización al cargar la ventana
window.addEventListener('DOMContentLoaded', () => {
    renderCurrentDate();
    loadTasksFromStorage();
    renderTasks();
});