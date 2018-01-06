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