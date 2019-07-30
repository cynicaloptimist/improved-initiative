import { BooleanTypeAnnotation } from "@babel/types";
import { escapeRegExp } from "lodash";

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
  const allStrings = strings
    .map(s => escapeRegExp(s))
    .sort((a, b) => b.localeCompare(a));
  if (allStrings.length === 0) {
    return new RegExp("a^");
  }
  return new RegExp(`\\b(${allStrings.join("|")})\\b`, "gim");
}

/**
 * This is just a wacky experiment in speeding something up that isn't even slow. :D
 */
class StringTrie {
  constructor (public Value = '', public CanTerminate = false) {}

  public Children: Map<string, StringTrie> = new Map();
  private LastKey: string;

  public AddString (toInsert: string)
  {
    if (toInsert.length === 0)
    {
      return this.CanTerminate = true;
    }
    const char = toInsert.charAt(0);
    if (!this.Children.has(char))
    {
      this.Children.set(char, new StringTrie(char));
      this.LastKey = char;
    }
    this.Children.get(char)!.AddString(toInsert.slice(1));
  }

  public ToRegexString ()
  {
    if (this.CanTerminate || this.Children.size === 0)
    {
      return this.Value;
    }
    if (this.Children.size === 1)
    {
      return this.Value + this.Children.get(this.LastKey)!.ToRegexString();
    }
    return `${this.Value}(${Array.from(this.Children.values()).map((t: StringTrie) => t.ToRegexString()).join("|")})`;
  }

  public Exec (source: string)
  {
    //
  }
}
export function compressedStringRegex(strings: string[]) {
  if (strings.length === 0) {
    return new RegExp("a^");
  }
  const trie = new StringTrie();
  strings.map(s => escapeRegExp(s)).forEach(s => trie.AddString(s));
  return new RegExp(trie.ToRegexString());
}

export function ParseJSONOrDefault<T>(json, defaultValue: T) {
  try {
    return JSON.parse(json);
  } catch {
    return defaultValue;
  }
}

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
