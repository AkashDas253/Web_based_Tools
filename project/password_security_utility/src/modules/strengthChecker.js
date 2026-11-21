export function evaluateStrength(password) {
    if (!password) {
        return {
            entropy: 0,
            score: 0,
            label: 'Empty',
            crackTime: 'Instant',
            feedback: ['Enter or generate a password.']
        };
    }

    let poolSize = 0;
    const feedback = [];

    if (/[a-z]/.test(password)) poolSize += 26;
    else feedback.push('Add lowercase characters.');

    if (/[A-Z]/.test(password)) poolSize += 26;
    else feedback.push('Add uppercase characters.');

    if (/[0-9]/.test(password)) poolSize += 10;
    else feedback.push('Add numeric digits.');

    if (/[^a-zA-Z0-9]/.test(password)) poolSize += 32;
    else feedback.push('Add special symbols.');

    const length = password.length;
    if (length < 8) feedback.push('Password length is insecurely short.');

    const entropy = poolSize > 0 ? Math.round(length * Math.log2(poolSize)) : 0;

    let score = 0;
    if (entropy >= 28) score = 1;
    if (entropy >= 36) score = 2;
    if (entropy >= 60) score = 3;
    if (entropy >= 80) score = 4;
    if (entropy >= 100) score = 5;

    // Based on 10 billion guesses/second
    const crackTimeSeconds = Math.pow(2, entropy) / 1e10;
    const crackTime = formatCrackTime(crackTimeSeconds);

    const labels = ['Very Weak', 'Weak', 'Moderate', 'Strong', 'Very Strong', 'Overkill'];

    return {
        entropy,
        score,
        label: labels[score],
        crackTime,
        feedback
    };
}

function formatCrackTime(seconds) {
    if (seconds < 1) return 'Instant';
    if (seconds < 60) return `${Math.round(seconds)} seconds`;
    if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
    if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
    if (seconds < 31536000) return `${Math.round(seconds / 86400)} days`;
    if (seconds < 31536000000) return `${Math.round(seconds / 31536000)} years`;
    return 'Centuries';
}