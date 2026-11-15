import { computeSHA1 } from '../utils/crypto.js';

export async function checkPwnedStatus(password) {
    if (!password) return { breached: false, count: 0 };

    try {
        const hash = await computeSHA1(password);
        const prefix = hash.slice(0, 5);
        const suffix = hash.slice(5);

        const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
        if (!response.ok) throw new Error('Breach API unavailable');

        const text = await response.text();
        const lines = text.split('\n');

        for (const line of lines) {
            const [hashSuffix, count] = line.trim().split(':');
            if (hashSuffix === suffix) {
                return { breached: true, count: parseInt(count, 10) };
            }
        }
        return { breached: false, count: 0 };
    } catch (error) {
        return { error: 'Check failed' };
    }
}