const STORAGE_KEY = 'synth_saved_sequence';

export class StorageManager {
    static saveToLocalStorage(sequenceData) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(sequenceData));
            return true;
        } catch (err) {
            console.error('Failed to save sequence to LocalStorage:', err);
            return false;
        }
    }

    static loadFromLocalStorage() {
        try {
            const item = localStorage.getItem(STORAGE_KEY);
            return item ? JSON.parse(item) : null;
        } catch (err) {
            console.error('Failed to load sequence from LocalStorage:', err);
            return null;
        }
    }

    static exportToJSONFile(sequenceData, filename = 'synth_sequence.json') {
        const jsonStr = JSON.stringify(sequenceData, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }

    static parseJSONFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const parsed = JSON.parse(e.target.result);
                    resolve(parsed);
                } catch (err) {
                    reject(new Error('Invalid JSON file format.'));
                }
            };
            reader.onerror = () => reject(new Error('Error reading file.'));
            reader.readAsText(file);
        });
    }
}