// ===== ESTADO =====
let tasks = [];
let currentFormat = 24;

// ===== INICIALIZAR DROPDOWNS AL CARGAR =====
window.addEventListener('DOMContentLoaded', () => {
  buildHourOptions(24);
  buildMinuteOptions();
  setFormat(24);
});

// ===== CONSTRUIR OPCIONES DE HORA =====
function buildHourOptions(format) {
  const selectors = ['start-h', 'end-h'];
  selectors.forEach(id => {
    const sel = document.getElementById(id);
    sel.innerHTML = '';

    if (format === 24) {
      // 00 a 23
      for (let i = 0; i <= 23; i++) {
        const opt = document.createElement('option');
        opt.value = i;
        opt.textContent = String(i).padStart(2, '0');
        sel.appendChild(opt);
      }
    } else {
      // 01 a 12
      for (let i = 1; i <= 12; i++) {
        const opt = document.createElement('option');
        opt.value = i;
        opt.textContent = String(i).padStart(2, '0');
        sel.appendChild(opt);
      }
    }
  });
}

// ===== CONSTRUIR OPCIONES DE MINUTOS (00-59) =====
function buildMinuteOptions() {
  const selectors = ['start-m', 'end-m'];
  selectors.forEach(id => {
    const sel = document.getElementById(id);
    sel.innerHTML = '';
    for (let i = 0; i <= 59; i++) {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = String(i).padStart(2, '0');
      sel.appendChild(opt);
    }
  });
}

// ===== CAMBIAR FORMATO =====
function setFormat(format) {
  currentFormat = format;

  document.getElementById('btn-24').classList.toggle('active', format === 24);
  document.getElementById('btn-12').classList.toggle('active', format === 12);

  // Reconstruir horas según el formato
  buildHourOptions(format);

  // Mostrar/ocultar AM/PM
  ['start-ampm', 'end-ampm'].forEach(id => {
    document.getElementById(id).classList.toggle('hidden', format === 24);
  });

  // Limpiar selects a valor inicial y ocultar error
  resetSelects();
  document.getElementById('error-msg').style.display = 'none';
}

// ===== RESETEAR SELECTS AL VALOR INICIAL =====
function resetSelects() {
  ['start-h', 'end-h', 'start-m', 'end-m'].forEach(id => {
    document.getElementById(id).selectedIndex = 0;
  });
  document.getElementById('start-ampm').value = 'AM';
  document.getElementById('end-ampm').value   = 'AM';
}

// ===== OBTENER MINUTOS TOTALES DESDE LOS SELECTS =====
function getMinutes(prefix) {
  let h = parseInt(document.getElementById(prefix + '-h').value);
  const m = parseInt(document.getElementById(prefix + '-m').value);

  if (currentFormat === 12) {
    const ampm = document.getElementById(prefix + '-ampm').value;
    h = h % 12; // 12 AM → 0, 12 PM → 12
    if (ampm === 'PM') h += 12;
  }

  return h * 60 + m;
}

// ===== FORMATEAR ETIQUETA DE HORA PARA LA TARJETA =====
function formatTimeLabel(prefix) {
  const h = document.getElementById(prefix + '-h').value;
  const m = document.getElementById(prefix + '-m').value;
  const hStr = String(h).padStart(2, '0');
  const mStr = String(m).padStart(2, '0');

  if (currentFormat === 24) {
    return hStr + ':' + mStr + ' hrs';
  } else {
    const ampm = document.getElementById(prefix + '-ampm').value;
    return hStr + ':' + mStr + ' ' + ampm;
  }
}

// ===== FORMATEAR DURACIÓN =====
function formatDuration(mins) {
  if (mins < 60) return mins + ' min';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? h + 'h' : h + 'h ' + m + 'm';
}

// ===== ESCAPAR HTML =====
function escHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ===== AGREGAR TAREA =====
function addTask() {
  const nameInput = document.getElementById('task-name');
  const errorMsg  = document.getElementById('error-msg');
  const name      = nameInput.value.trim();

  if (!name) {
    errorMsg.style.display = 'block';
    errorMsg.textContent = 'Por favor escribe el nombre de la tarea.';
    return;
  }

  const startMin = getMinutes('start');
  const endMin   = getMinutes('end');

  if (endMin <= startMin) {
    errorMsg.style.display = 'block';
    errorMsg.textContent = 'La hora de fin debe ser mayor a la hora de inicio.';
    return;
  }

  errorMsg.style.display = 'none';

  const duration   = endMin - startMin;
  const startLabel = formatTimeLabel('start');
  const endLabel   = formatTimeLabel('end');

  tasks.push({ id: Date.now(), name, startLabel, endLabel, duration });

  // Limpiar formulario
  nameInput.value = '';
  resetSelects();
  nameInput.focus();

  renderTasks();
}

// ===== ELIMINAR TAREA =====
function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  renderTasks();
}

// ===== LIMPIAR TODAS =====
function clearAll() {
  if (tasks.length === 0) return;
  if (confirm('¿Estás seguro de que deseas eliminar todas las tareas?')) {
    tasks = [];
    renderTasks();
  }
}

// ===== RENDERIZAR LISTA =====
function renderTasks() {
  const list       = document.getElementById('tasks-list');
  const emptyState = document.getElementById('empty-state');
  const statsRow   = document.getElementById('stats-row');
  const countBadge = document.getElementById('task-count');

  countBadge.textContent = tasks.length + (tasks.length === 1 ? ' tarea' : ' tareas');

  if (tasks.length === 0) {
    list.innerHTML = '';
    list.appendChild(emptyState);
    emptyState.style.display = 'block';
    statsRow.style.display = 'none';
    return;
  }

  list.innerHTML = '';

  tasks.forEach(t => {
    const div = document.createElement('div');
    div.className = 'task-item';
    div.innerHTML = `
      <div class="task-dot"></div>
      <div class="task-info">
        <div class="task-name">${escHtml(t.name)}</div>
        <div class="task-times">Inicio: ${t.startLabel} &nbsp;→&nbsp; Fin: ${t.endLabel}</div>
      </div>
      <div class="task-duration">
        <div class="duration-value">${formatDuration(t.duration)}</div>
        <div class="duration-label">duración</div>
      </div>
      <button class="btn-delete" onclick="deleteTask(${t.id})" title="Eliminar tarea">✕</button>
    `;
    list.appendChild(div);
  });

  const totalMins = tasks.reduce((sum, t) => sum + t.duration, 0);
  const longest   = tasks.reduce((a, b) => a.duration > b.duration ? a : b);

  document.getElementById('stat-total').textContent        = formatDuration(totalMins);
  document.getElementById('stat-total-min').textContent    = totalMins + ' minutos en total';
  document.getElementById('stat-longest').textContent      = formatDuration(longest.duration);
  document.getElementById('stat-longest-name').textContent = longest.name;

  statsRow.style.display = 'grid';
}

// ===== ENTER PARA AGREGAR =====
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('task-name').addEventListener('keydown', e => {
    if (e.key === 'Enter') addTask();
  });
});
