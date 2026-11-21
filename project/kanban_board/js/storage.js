const STORAGE_KEY = 'kanban_board_data';

export const Storage = {
  // Load data from LocalStorage
  loadLocal() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (err) {
      console.error('Failed to load local state:', err);
      return null;
    }
  },

  // Save state object to LocalStorage
  saveLocal(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.error('Failed to save local state:', err);
    }
  },

  // Export state to downloadable JSON file
  exportToFile(data, filename = 'kanban-board.json') {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    
    URL.revokeObjectURL(url);
  },

  // Read external JSON file using FileReader API
  importFromFile(file) {
    return new Promise((resolve, reject) => {
      if (!file || file.type !== 'application/json') {
        return reject(new Error('Please upload a valid JSON file.'));
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target.result);
          resolve(parsed);
        } catch (err) {
          reject(new Error('Invalid JSON format in file.'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file.'));
      reader.readAsText(file);
    });
  }
};