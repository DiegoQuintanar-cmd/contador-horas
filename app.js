// ===== ESTADO =====
let tasks = [];
let currentFormat = 24;

// ===== INICIALIZAR AL CARGAR =====
window.addEventListener('DOMContentLoaded', () => {
  buildHourOptions(24);
  buildMinuteOptions();
  buildSecondOptions();
  setFormat(24);
  setDefaultDates();
});

// ===== FECHA DE HOY POR DEFECTO =====
function setDefaultDates() {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('start-date').value = today;
  document.getElementById('end-date').value   = today;
}

// ===== CONSTRUIR OPCIONES DE HORA =====
function buildHourOptions(format) {
  ['start-h', 'end-h'].forEach(id => {
    const sel = document.getElementById(id);
    sel.innerHTML = '';
    if (format === 24) {
      for (let i = 0; i <= 23; i++) {
        const opt = document.createElement('option');
        opt.value = i;
        opt.textContent = String(i).padStart(2, '0');
        sel.appendChild(opt);
      }
    } else {
      for (let i = 1; i <= 12; i++) {
        const opt = document.createElement('option');
        opt.value = i;
        opt.textContent = String(i).padStart(2, '0');
        sel.appendChild(opt);
      }
    }
  });
}

// ===== CONSTRUIR OPCIONES DE MINUTOS Y SEGUNDOS (00-59) =====
function buildMinuteOptions() {
  ['start-m', 'end-m'].forEach(id => {
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

function buildSecondOptions() {
  ['start-s', 'end-s'].forEach(id => {
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
  buildHourOptions(format);
  ['start-ampm', 'end-ampm'].forEach(id => {
    document.getElementById(id).classList.toggle('hidden', format === 24);
  });
  resetSelects();
  document.getElementById('error-msg').style.display = 'none';
}

// ===== RESETEAR SELECTS AL VALOR INICIAL =====
function resetSelects() {
  ['start-h', 'end-h', 'start-m', 'end-m', 'start-s', 'end-s'].forEach(id => {
    document.getElementById(id).selectedIndex = 0;
  });
  document.getElementById('start-ampm').value = 'AM';
  document.getElementById('end-ampm').value   = 'AM';
  setDefaultDates();
}

// ===== OBTENER TIMESTAMP EN SEGUNDOS DESDE LOS INPUTS =====
function getTotalSeconds(prefix) {
  const dateVal = document.getElementById(prefix + '-date').value;
  let h         = parseInt(document.getElementById(prefix + '-h').value);
  const m       = parseInt(document.getElementById(prefix + '-m').value);
  const s       = parseInt(document.getElementById(prefix + '-s').value);

  if (currentFormat === 12) {
    const ampm = document.getElementById(prefix + '-ampm').value;
    h = h % 12;
    if (ampm === 'PM') h += 12;
  }

  // dateVal is YYYY-MM-DD; build ISO string to avoid timezone offset issues
  const dt = new Date(`${dateVal}T${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`);
  return Math.floor(dt.getTime() / 1000);
}

// ===== FORMATEAR ETIQUETA DE FECHA+HORA PARA LA TARJETA =====
function formatTimeLabel(prefix) {
  const dateVal = document.getElementById(prefix + '-date').value; // YYYY-MM-DD
  const h       = document.getElementById(prefix + '-h').value;
  const m       = document.getElementById(prefix + '-m').value;
  const s       = document.getElementById(prefix + '-s').value;
  const hStr    = String(h).padStart(2, '0');
  const mStr    = String(m).padStart(2, '0');
  const sStr    = String(s).padStart(2, '0');

  // Convertir YYYY-MM-DD → DD/MM/YYYY
  const [y, mo, d] = dateVal.split('-');
  const dateStr = `${d}/${mo}/${y}`;

  let timeStr;
  if (currentFormat === 24) {
    timeStr = `${hStr}:${mStr}:${sStr}`;
  } else {
    const ampm = document.getElementById(prefix + '-ampm').value;
    timeStr = `${hStr}:${mStr}:${sStr} ${ampm}`;
  }

  return `${dateStr} ${timeStr}`;
}

// ===== FORMATEAR DURACIÓN (d / h / m / s) =====
function formatDuration(secs) {
  const d = Math.floor(secs / 86400);
  const h = Math.floor((secs % 86400) / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;

  if (d > 0) return `${d}d ${h}h ${m}m ${s}s`;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
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

  const startDate = document.getElementById('start-date').value;
  const endDate   = document.getElementById('end-date').value;

  if (!startDate || !endDate) {
    errorMsg.style.display = 'block';
    errorMsg.textContent = 'Por favor selecciona las fechas de inicio y fin.';
    return;
  }

  const startSecs = getTotalSeconds('start');
  const endSecs   = getTotalSeconds('end');

  if (endSecs <= startSecs) {
    errorMsg.style.display = 'block';
    errorMsg.textContent = 'La fecha y hora de fin deben ser mayores a las de inicio.';
    return;
  }

  errorMsg.style.display = 'none';

  const duration   = endSecs - startSecs;
  const startLabel = formatTimeLabel('start');
  const endLabel   = formatTimeLabel('end');

  tasks.push({ id: Date.now(), name, startLabel, endLabel, duration });

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
        <div class="task-times">
          Inicio: ${t.startLabel}<br>
          Fin: ${t.endLabel}
        </div>
      </div>
      <div class="task-duration">
        <div class="duration-value">${formatDuration(t.duration)}</div>
        <div class="duration-label">duración</div>
      </div>
      <button class="btn-delete" onclick="deleteTask(${t.id})" title="Eliminar tarea">✕</button>
    `;
    list.appendChild(div);
  });

  const totalSecs = tasks.reduce((sum, t) => sum + t.duration, 0);
  const longest   = tasks.reduce((a, b) => a.duration > b.duration ? a : b);

  document.getElementById('stat-total').textContent      = formatDuration(totalSecs);
  document.getElementById('stat-total-sec').textContent  = totalSecs + ' segundos en total';
  document.getElementById('stat-longest').textContent    = formatDuration(longest.duration);
  document.getElementById('stat-longest-name').textContent = longest.name;

  statsRow.style.display = 'grid';
}

// ===== COPIAR RESUMEN AL PORTAPAPELES =====
function copyStat(type, btn) {
  let text;
  if (type === 'total') {
    const value = document.getElementById('stat-total').textContent;
    const secs  = document.getElementById('stat-total-sec').textContent;
    text = `Total de horas trabajadas: ${value}\n(${secs})`;
  } else {
    const value = document.getElementById('stat-longest').textContent;
    const name  = document.getElementById('stat-longest-name').textContent;
    text = `Tarea más larga: ${name}\nDuración: ${value}`;
  }

  const showCopied = () => {
    const original = btn.textContent;
    btn.textContent = '✓ Copiado';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.textContent = original;
      btn.classList.remove('copied');
    }, 2000);
  };

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(showCopied).catch(() => fallbackCopy(text, showCopied));
  } else {
    fallbackCopy(text, showCopied);
  }
}

function fallbackCopy(text, callback) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none;';
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  try { document.execCommand('copy'); } catch (e) {}
  document.body.removeChild(ta);
  callback();
}

// ===== ENTER PARA AGREGAR =====
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('task-name').addEventListener('keydown', e => {
    if (e.key === 'Enter') addTask();
  });
});
