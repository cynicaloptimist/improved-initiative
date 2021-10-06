import _ = require("lodash");

export class Importer {
  constructor(protected domElement: Element) {}

  public getString(selector) {
    return this.domElement.querySelector<Element>(selector)?.innerHTML || "";
  }

  public getInt(selector) {
    const int = this.domElement.querySelector<Element>(selector)?.innerHTML;
    if (int) {
      return parseInt(int);
    }
    return 0;
  }

  public getValueAndNotes(selector: string) {
    const matches = this.getString(selector).match(/([\d]+) ?(.*)/);
    if (!matches) {
      return { Value: 0, Notes: "" };
    }
    const [, value, notes] = matches;
    return {
      Value: parseInt(value),
      Notes: notes || ""
    };
  }

  public getCommaSeparatedStrings(selector: string) {
    const commaDelimitedString = this.getString(selector);
    if (commaDelimitedString.length > 0) {
      return commaDelimitedString.split(/, ?/);
    }
    return [];
  }

  public getCommaSeparatedModifiers(selector: string) {
    const entries = this.getCommaSeparatedStrings(selector);
    return entries.map(e => {
      // Extract the last piece of the name/modifier, and parse an int from only that, ensuring the name can contain any manner of spacing.
      const nameAndModifier = e.split(" ");
      const modifierValue = parseInt(nameAndModifier.pop());

      // Join the remaining string name, and trim outside spacing just in case.
      return {
        Name: nameAndModifier.join(" ").trim(),
        Modifier: modifierValue
      };
    });
  }

  public getPowers(selector: string) {
    return _.map(this.domElement.querySelectorAll(selector), p => ({
      Name: p.querySelector<Element>("name")?.innerHTML,
      Content: Array.from(p.querySelectorAll<Element>("text")).map(pp => pp?.innerHTML).join("\n"),
      Usage: ""
    }));
  }
}
