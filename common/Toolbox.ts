import _ = require("lodash");

export interface KeyValueSet<T> {
    [key: string]: T;
}

export function toModifierString(number: number): string {
    if (number >= 0) {
        return `+${number}`;
    }
    return number.toString();
}

export function probablyUniqueString(): string {
    //string contains only easily relayable characters for forward 
    //compatability with speech-based data transfer ;-)
    let chars = "1234567890abcdefghijkmnpqrstuvxyz";
    let probablyUniqueString = "";
    for (let i = 0; i < 8; i++) {
        let index = Math.floor(Math.random() * chars.length);
        probablyUniqueString += chars[index];
    }

    return probablyUniqueString;
}

export function concatenatedStringRegex(strings: string[]) {
    const allStrings = strings.map(s => _.escapeRegExp(s)).sort((a, b) => b.localeCompare(a));
    if (allStrings.length === 0) {
        return new RegExp("a^");
    }
    return new RegExp(`\\b(${allStrings.join("|")})\\b`, "gim");
}