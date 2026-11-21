import { Storage } from './storage.js';

const DEFAULT_STATE = {
  columns: [
    { id: 'todo', title: 'To Do' },
    { id: 'in-progress', title: 'In Progress' },
    { id: 'done', title: 'Done' }
  ],
  tasks: [
    {
      id: 't-1',
      title: 'Modular Codebase Setup',
      description: 'Split into modules with state and storage logic.',
      priority: 'high',
      category: 'Architecture',
      status: 'done',
      dueDate: '2026-08-15'
    }
  ]
};

class BoardState {
  constructor() {
    this.data = Storage.loadLocal() || DEFAULT_STATE;
    this.listeners = [];
  }

  subscribe(listener) {
    this.listeners.push(listener);
  }

  notify() {
    Storage.saveLocal(this.data);
    this.listeners.forEach((listener) => listener(this.data));
  }

  getState() {
    return this.data;
  }

  setState(newState) {
    this.data = newState;
    this.notify();
  }

  // Create or Update task logic
  saveTask(taskData) {
    if (taskData.id) {
      // Edit mode
      const index = this.data.tasks.findIndex((t) => t.id === taskData.id);
      if (index !== -1) {
        this.data.tasks[index] = { ...this.data.tasks[index], ...taskData };
      }
    } else {
      // Create mode
      const newTask = {
        ...taskData,
        id: `task-${Date.now()}`
      };
      this.data.tasks.push(newTask);
    }
    this.notify();
  }

  moveTask(taskId, targetStatus) {
    const task = this.data.tasks.find((t) => t.id === taskId);
    if (task) {
      task.status = targetStatus;
      this.notify();
    }
  }

  deleteTask(taskId) {
    this.data.tasks = this.data.tasks.filter((t) => t.id !== taskId);
    this.notify();
  }
}

export const state = new BoardState();