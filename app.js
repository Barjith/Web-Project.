// ── State ─────────────────────────────────────────────────────────────────────
let tasks  = JSON.parse(localStorage.getItem('tasks') || '[]');
let filter = 'all';

// ── Theme ─────────────────────────────────────────────────────────────────────
const html      = document.documentElement;
const themeBtn  = document.getElementById('themeBtn');
const saved     = localStorage.getItem('theme') || 'dark';
html.setAttribute('data-theme', saved);
themeBtn.textContent = saved === 'dark' ? '🌙' : '☀️';

themeBtn.addEventListener('click', () => {
  const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  themeBtn.textContent = next === 'dark' ? '🌙' : '☀️';
});

// ── Save ──────────────────────────────────────────────────────────────────────
const save = () => localStorage.setItem('tasks', JSON.stringify(tasks));

// ── Render ────────────────────────────────────────────────────────────────────
const render = () => {
  const list       = document.getElementById('taskList');
  const emptyState = document.getElementById('emptyState');

  const visible = tasks.filter(t => {
    if (filter === 'active')    return !t.done;
    if (filter === 'completed') return  t.done;
    return true;
  });

  list.innerHTML = '';

  if (visible.length === 0) {
    emptyState.hidden = false;
  } else {
    emptyState.hidden = true;
    visible.forEach(task => {
      const li = document.createElement('li');
      li.className   = `task-item${task.done ? ' completed' : ''}`;
      li.setAttribute('data-priority', task.priority);
      li.setAttribute('role', 'listitem');

      li.innerHTML = `
        <input
          type="checkbox"
          class="task-check"
          ${task.done ? 'checked' : ''}
          aria-label="Mark '${escHtml(task.text)}' as ${task.done ? 'incomplete' : 'complete'}"
        />
        <div class="task-body">
          <span class="task-text">${escHtml(task.text)}</span>
          <div class="task-meta">
            <span class="priority-badge ${task.priority}">${task.priority}</span>
            <span class="task-date">${task.date}</span>
          </div>
        </div>
        <button class="btn-delete" aria-label="Delete task '${escHtml(task.text)}'">🗑️</button>
      `;

      // Toggle done
      li.querySelector('.task-check').addEventListener('change', () => {
        task.done = !task.done;
        save(); render();
      });

      // Delete
      li.querySelector('.btn-delete').addEventListener('click', () => {
        tasks = tasks.filter(t => t.id !== task.id);
        li.style.transform  = 'translateX(30px)';
        li.style.opacity    = '0';
        li.style.transition = 'all 0.25s ease';
        setTimeout(() => { save(); render(); }, 250);
      });

      list.appendChild(li);
    });
  }

  // Update stats
  document.getElementById('totalCount').textContent  = tasks.length;
  document.getElementById('activeCount').textContent = tasks.filter(t => !t.done).length;
  document.getElementById('doneCount').textContent   = tasks.filter(t =>  t.done).length;
};

// ── Add task ──────────────────────────────────────────────────────────────────
document.getElementById('addForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const input    = document.getElementById('taskInput');
  const priority = document.getElementById('prioritySelect').value;
  const text     = input.value.trim();
  if (!text) { input.focus(); return; }

  tasks.unshift({
    id:       Date.now(),
    text,
    priority,
    done:     false,
    date:     new Date().toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' }),
  });

  input.value = '';
  input.focus();
  save(); render();
});

// ── Filters ───────────────────────────────────────────────────────────────────
document.querySelectorAll('.filter-btn[data-filter]').forEach(btn => {
  btn.addEventListener('click', () => {
    filter = btn.dataset.filter;
    document.querySelectorAll('.filter-btn[data-filter]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    render();
  });
});

document.getElementById('clearDone').addEventListener('click', () => {
  tasks = tasks.filter(t => !t.done);
  save(); render();
});

// ── Helpers ───────────────────────────────────────────────────────────────────
const escHtml = str => str.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

// ── Init ──────────────────────────────────────────────────────────────────────
render();
