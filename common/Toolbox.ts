import { escapeRegExp } from "lodash";
export function toModifierString(number: number): string {
  if (number >= 0) {
    return `+${number}`;
  }
  return number.toString();
}

export function probablyUniqueString(): string {
  //string contains only easily relayable characters for forward
  //compatability with speech-based data transfer ;-)
  const chars = "1234567890abcdefghijkmnpqrstuvxyz";
  let probablyUniqueString = "";
  for (let i = 0; i < 8; i++) {
    const index = Math.floor(Math.random() * chars.length);
    probablyUniqueString += chars[index];
  }

  return probablyUniqueString;
}

export function concatenatedStringRegex(strings: string[]) {
  const allStrings = strings
    .map(s => escapeRegExp(s))
    .sort((a, b) => b.localeCompare(a));
  if (allStrings.length === 0) {
    return new RegExp("a^");
  }
  return new RegExp(`\\b(${allStrings.join("|")})\\b`, "gim");
}

export function ParseJSONOrDefault<T>(json: string, defaultValue: T): T {
  try {
    return JSON.parse(json);
  } catch {
    return defaultValue;
  }
}

export function normalizeChallengeRating(challengeRating: string): string {
  if (challengeRating == "0.125") {
    return "1/8";
  }
  if (challengeRating == "0.25") {
    return "1/4";
  }
  if (challengeRating == "0.5") {
    return "1/2";
  }
  return challengeRating;
}

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
