export class UI {
  constructor(boardElement, stateInstance) {
    this.boardEl = boardElement;
    this.state = stateInstance;
  }

  render() {
    const { columns, tasks } = this.state.getState();
    this.boardEl.innerHTML = '';

    columns.forEach((col) => {
      const colTasks = tasks.filter((t) => t.status === col.id);
      const colNode = this.createColumnNode(col, colTasks);
      this.boardEl.appendChild(colNode);
    });
  }

  createColumnNode(column, tasks) {
    const colDiv = document.createElement('div');
    colDiv.className = 'column';
    colDiv.dataset.columnId = column.id;

    colDiv.innerHTML = `
      <div class="column-header">
        <h2>${column.title}</h2>
        <span class="count">${tasks.length}</span>
      </div>
      <div class="task-list" data-status="${column.id}">
        ${tasks.map((task) => this.createTaskHTML(task)).join('')}
      </div>
    `;

    return colDiv;
  }

  createTaskHTML(task) {
    // Retrieve tags array with fallback for legacy single category string
    const tagsList = Array.isArray(task.tags) && task.tags.length > 0
      ? task.tags
      : (task.category ? [task.category] : ['General']);

    const tagsHTML = tagsList
      .map((tag) => `<span class="tag">${this.escapeHTML(tag)}</span>`)
      .join('');

    // Check if task is overdue (past due date and not marked as done)
    const today = new Date().toISOString().split('T')[0];
    const isOverdue = Boolean(task.dueDate) && task.dueDate < today && task.status !== 'done';

    return `
      <div class="task-card priority-${task.priority || 'medium'}" data-id="${task.id}">
        <div class="card-header">
          <div class="tags-container">
            ${tagsHTML}
          </div>
          <span class="priority-badge ${task.priority}">${task.priority}</span>
        </div>
        <h3>${this.escapeHTML(task.title)}</h3>
        <p>${this.escapeHTML(task.description || '')}</p>
        
        ${task.dueDate ? `
          <div class="due-date ${isOverdue ? 'overdue' : ''}">
            📅 ${task.dueDate} ${isOverdue ? '⚠️ (Overdue)' : ''}
          </div>
        ` : ''}

        <div class="task-actions">
          <button class="edit-btn" data-action="edit">✏️ Edit</button>
          <button class="move-btn" data-action="move">➔ Move</button>
          <button class="delete-btn" data-action="delete">🗑️</button>
        </div>
      </div>
    `;
  }

  escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      (tag) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }
}