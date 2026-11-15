import { generateRandomPassword, generatePassphrase } from './generator.js';
import { evaluateStrength } from './strengthChecker.js';
import { checkPwnedStatus } from './hibpChecker.js';

export function initUI() {
    let currentTab = 'generator';
    let breachDebounceTimer = null;
    const history = [];

    // DOM Selectors
    const passwordOutput = document.getElementById('password-output');
    const copyBtn = document.getElementById('copy-btn');
    const refreshBtn = document.getElementById('refresh-btn');
    const fillBar = document.getElementById('strength-bar-fill');
    const metricLabel = document.getElementById('metric-label');
    const metricEntropy = document.getElementById('metric-entropy');
    const metricCrack = document.getElementById('metric-crack');
    const metricBreach = document.getElementById('metric-breach');
    const feedbackList = document.getElementById('feedback-list');
    const historyList = document.getElementById('history-list');
    const clearHistoryBtn = document.getElementById('clear-history-btn');

    // Controls
    const charLength = document.getElementById('char-length');
    const charLengthVal = document.getElementById('char-length-val');
    const wordCount = document.getElementById('word-count');
    const wordCountVal = document.getElementById('word-count-val');
    const bulkCount = document.getElementById('bulk-count');
    const bulkCountVal = document.getElementById('bulk-count-val');
    const bulkOutput = document.getElementById('bulk-output');
    const generateBulkBtn = document.getElementById('generate-bulk-btn');

    // Navigation Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            e.target.classList.add('active');
            currentTab = e.target.dataset.tab;
            document.getElementById(`tab-${currentTab}`).classList.add('active');
            handleGeneration();
        });
    });

    function handleGeneration() {
        let password = '';
        if (currentTab === 'generator') {
            password = generateRandomPassword({
                length: parseInt(charLength.value, 10),
                uppercase: document.getElementById('opt-uppercase').checked,
                lowercase: document.getElementById('opt-lowercase').checked,
                numbers: document.getElementById('opt-numbers').checked,
                symbols: document.getElementById('opt-symbols').checked,
                excludeAmbiguous: document.getElementById('opt-exclude-ambiguous').checked
            });
        } else if (currentTab === 'passphrase') {
            password = generatePassphrase({
                wordCount: parseInt(wordCount.value, 10),
                separator: document.getElementById('separator-select').value,
                capitalize: document.getElementById('opt-capitalize').checked,
                includeNumber: document.getElementById('opt-include-number').checked
            });
        }

        if (password) {
            passwordOutput.value = password;
            updateMetrics(password);
            addToHistory(password);
        }
    }

    function updateMetrics(password) {
        const { entropy, score, label, crackTime, feedback } = evaluateStrength(password);
        
        metricLabel.textContent = label;
        metricEntropy.textContent = `${entropy} bits`;
        metricCrack.textContent = crackTime;

        const fillColors = ['#ef4444', '#ef4444', '#f59e0b', '#38bdf8', '#10b981', '#059669'];
        fillBar.style.width = `${(score / 5) * 100}%`;
        fillBar.style.backgroundColor = fillColors[score];

        feedbackList.innerHTML = feedback.map(item => `<div>• ${item}</div>`).join('');

        // Debounced HIBP Audit
        metricBreach.textContent = 'Checking...';
        metricBreach.style.color = '#94a3b8';
        clearTimeout(breachDebounceTimer);
        
        breachDebounceTimer = setTimeout(async () => {
            const res = await checkPwnedStatus(password);
            if (res.error) {
                metricBreach.textContent = 'Unavailable';
            } else if (res.breached) {
                metricBreach.textContent = `Breached (${res.count}x)`;
                metricBreach.style.color = '#ef4444';
            } else {
                metricBreach.textContent = 'Safe (0 breaches)';
                metricBreach.style.color = '#10b981';
            }
        }, 500);
    }

    function addToHistory(password) {
        if (history.includes(password)) return;
        history.unshift(password);
        if (history.length > 10) history.pop();
        renderHistory();
    }

    function renderHistory() {
        historyList.innerHTML = history.map(item => `<li>${item}</li>`).join('');
    }

    // Event Bindings
    charLength.addEventListener('input', (e) => { charLengthVal.textContent = e.target.value; handleGeneration(); });
    wordCount.addEventListener('input', (e) => { wordCountVal.textContent = e.target.value; handleGeneration(); });
    bulkCount.addEventListener('input', (e) => { bulkCountVal.textContent = e.target.value; });

    document.querySelectorAll('input[type="checkbox"], #separator-select').forEach(elem => {
        elem.addEventListener('change', handleGeneration);
    });

    passwordOutput.addEventListener('input', (e) => updateMetrics(e.target.value));
    refreshBtn.addEventListener('click', handleGeneration);

    copyBtn.addEventListener('click', () => {
        if (!passwordOutput.value) return;
        navigator.clipboard.writeText(passwordOutput.value);
        copyBtn.textContent = 'Copied!';
        setTimeout(() => copyBtn.textContent = 'Copy', 1500);
    });

    generateBulkBtn.addEventListener('click', () => {
        const count = parseInt(bulkCount.value, 10);
        const list = [];
        for (let i = 0; i < count; i++) {
            list.push(generateRandomPassword({
                length: parseInt(charLength.value, 10),
                uppercase: true, lowercase: true, numbers: true, symbols: true, excludeAmbiguous: false
            }));
        }
        bulkOutput.value = list.join('\n');
    });

    clearHistoryBtn.addEventListener('click', () => {
        history.length = 0;
        renderHistory();
    });

    handleGeneration();
}