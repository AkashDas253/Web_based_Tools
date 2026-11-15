export class TaskModal {
  constructor(modalId, formId, onSubmitCallback) {
    this.modal = document.getElementById(modalId);
    this.form = document.getElementById(formId);
    this.onSubmit = onSubmitCallback;

    this.initEvents();
  }

  initEvents() {
    // Close button & Cancel click
    this.modal.querySelector('#close-modal-btn').addEventListener('click', () => this.close());
    this.modal.querySelector('#cancel-btn').addEventListener('click', () => this.close());

    // Outside click backdrop close
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.close();
    });

    // Form submit listener
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();

      // Parse comma-separated tags into a clean array
      const rawTags = document.getElementById('task-category-input').value;
      const tags = rawTags
        ? rawTags.split(',').map((tag) => tag.trim()).filter((tag) => tag.length > 0)
        : [];

      const taskData = {
        id: document.getElementById('task-id').value || null,
        title: document.getElementById('task-title-input').value.trim(),
        description: document.getElementById('task-desc-input').value.trim(),
        priority: document.getElementById('task-priority-input').value,
        tags: tags.length > 0 ? tags : ['General'],
        status: document.getElementById('task-status-input').value,
        dueDate: document.getElementById('task-due-input').value
      };

      this.onSubmit(taskData);
      this.close();
    });
  }

  open(task = null) {
    this.form.reset();

    if (task) {
      document.getElementById('modal-title').textContent = 'Edit Task';
      document.getElementById('task-id').value = task.id;
      document.getElementById('task-title-input').value = task.title;
      document.getElementById('task-desc-input').value = task.description || '';
      document.getElementById('task-priority-input').value = task.priority || 'medium';

      // Support array of tags with fallback to legacy category string
      const tagsArray = Array.isArray(task.tags)
        ? task.tags
        : (task.category ? [task.category] : []);
      document.getElementById('task-category-input').value = tagsArray.join(', ');

      document.getElementById('task-status-input').value = task.status || 'todo';
      document.getElementById('task-due-input').value = task.dueDate || '';
    } else {
      document.getElementById('modal-title').textContent = 'Add New Task';
      document.getElementById('task-id').value = '';
    }

    this.modal.classList.remove('hidden');
  }

  close() {
    this.modal.classList.add('hidden');
    this.form.reset();
  }
}