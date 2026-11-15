import { state } from './state.js';
import { Storage } from './storage.js';
import { UI } from './ui.js';
import { TaskModal } from './modal.js';

document.addEventListener('DOMContentLoaded', () => {
  const boardEl = document.getElementById('kanban-board');
  const ui = new UI(boardEl, state);

  // Initialize Modal Handler
  const taskModal = new TaskModal('task-modal', 'task-form', (taskData) => {
    state.saveTask(taskData);
  });

  ui.render();
  state.subscribe(() => ui.render());

  // Top Bar Event Listeners
  document.getElementById('add-task-btn').addEventListener('click', () => {
    taskModal.open();
  });

  document.getElementById('export-btn').addEventListener('click', () => {
    Storage.exportToFile(state.getState());
  });

  document.getElementById('import-file').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const importedData = await Storage.importFromFile(file);
      if (importedData?.columns && importedData?.tasks) {
        state.setState(importedData);
      } else {
        alert('Invalid Kanban JSON format.');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      e.target.value = '';
    }
  });

  // Delegated Task Actions (Edit, Move, Delete)
  boardEl.addEventListener('click', (e) => {
    const action = e.target.dataset.action;
    const taskCard = e.target.closest('.task-card');
    if (!taskCard) return;

    const taskId = taskCard.dataset.id;
    const task = state.getState().tasks.find((t) => t.id === taskId);

    if (action === 'delete') {
      if (confirm('Are you sure you want to delete this task?')) {
        state.deleteTask(taskId);
      }
    } else if (action === 'edit') {
      taskModal.open(task);
    } else if (action === 'move') {
      const columns = state.getState().columns;
      const currentIndex = columns.findIndex((c) => c.id === task.status);
      const nextIndex = (currentIndex + 1) % columns.length;
      state.moveTask(taskId, columns[nextIndex].id);
    }
  });
});