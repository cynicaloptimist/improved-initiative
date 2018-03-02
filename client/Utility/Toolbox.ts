export interface KeyValueSet<T> {
    [key: string]: T;
}

export function removeFirst<T>(array: T[], item: T) {
    const index = array.indexOf(item);
    if (index > -1) {
        array.splice(index, 1);
    }
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

export function combatantCountsByName(name: string, counts: { [name: string]: number }, oldName?: string): { [name: string]: number } {
    if (name == oldName) { return counts; }
    if (oldName) {
        if (!counts[oldName]) { counts[oldName] = 1; }
        counts[oldName] = counts[oldName] - 1;
    }
    if (!counts[name]) {
        counts[name] = 1;
    } else {
        counts[name] = counts[name] + 1;
    }
    return counts;
}
