import { getRandomInt } from '../utils/crypto.js';
import { WORD_LIST } from '../utils/wordlist.js';

const CHAR_SETS = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
};

const AMBIGUOUS_REGEX = /[0O1Il]/g;

export function generateRandomPassword(options) {
    const { length, uppercase, lowercase, numbers, symbols, excludeAmbiguous } = options;

    let charPool = '';
    const mandatoryChars = [];

    const buildPool = (key) => {
        let set = CHAR_SETS[key];
        if (excludeAmbiguous) {
            set = set.replace(AMBIGUOUS_REGEX, '');
        }
        return set;
    };

    if (uppercase) {
        const pool = buildPool('uppercase');
        if (pool) { charPool += pool; mandatoryChars.push(getRandomChar(pool)); }
    }
    if (lowercase) {
        const pool = buildPool('lowercase');
        if (pool) { charPool += pool; mandatoryChars.push(getRandomChar(pool)); }
    }
    if (numbers) {
        const pool = buildPool('numbers');
        if (pool) { charPool += pool; mandatoryChars.push(getRandomChar(pool)); }
    }
    if (symbols) {
        const pool = buildPool('symbols');
        if (pool) { charPool += pool; mandatoryChars.push(getRandomChar(pool)); }
    }

    if (!charPool) return '';

    const passwordArray = [...mandatoryChars];
    const remainingLength = Math.max(0, length - mandatoryChars.length);

    for (let i = 0; i < remainingLength; i++) {
        passwordArray.push(getRandomChar(charPool));
    }

    return shuffleArray(passwordArray).join('');
}

export function generatePassphrase(options) {
    const { wordCount, separator, capitalize, includeNumber } = options;
    const words = [];

    for (let i = 0; i < wordCount; i++) {
        let word = WORD_LIST[getRandomInt(WORD_LIST.length)];
        if (capitalize) {
            word = word.charAt(0).toUpperCase() + word.slice(1);
        }
        words.push(word);
    }

    if (includeNumber && words.length > 0) {
        const randIndex = getRandomInt(words.length);
        words[randIndex] += getRandomInt(100);
    }

    return words.join(separator);
}

function getRandomChar(charset) {
    return charset[getRandomInt(charset.length)];
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = getRandomInt(i + 1);
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}