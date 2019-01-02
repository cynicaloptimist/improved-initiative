import fs = require("fs");
import path = require("path");
import { Listable, ServerListing } from "../common/Listable";

const sourceAbbreviations = {
  "monster-manual": "mm",
  "players-handbook": "phb"
};

//Lowercase, replace whitespace with dashes, remove non-word characters.
const formatStringForId = (str: string) =>
  str
    .toLocaleLowerCase()
    .replace(/[\s]/g, "-")
    .replace(/[^a-z0-9-]/g, "");

const createId = (name: string, source: string) => {
  const sourceString = formatStringForId(source);
  const sourcePrefix = sourceAbbreviations[sourceString] || sourceString;
  const lowerCaseName = formatStringForId(name);
  return `${sourcePrefix}.${lowerCaseName}`;
};

interface Combatant {
  Alias: string;
}
export interface SavedEncounter extends Listable {
  Combatants: Combatant[];
}

export const GetEncounterKeywords = (encounter: SavedEncounter) =>
  (encounter.Combatants || []).map(c => c.Alias).join(" ");

export class Library<TItem extends Listable> {
  private items: { [id: string]: TItem } = {};
  private listings: ServerListing[] = [];

  constructor(
    private route: string,
    private getKeywords: (item: TItem) => string
  ) {}

  public static FromFile<I extends Listable>(
    filename: string,
    route: string,
    getKeywords: (item: I) => string
  ): Library<I> {
    const library = new Library<I>(route, getKeywords);

    const filePath = path.join(__dirname, "..", filename);

    fs.readFile(filePath, (err, buffer) => {
      if (err) {
        throw `Couldn't read ${filePath} as a library: ${err}`;
      }

      const newItems: any[] = JSON.parse(buffer.toString());
      library.Add(newItems);
    });

    return library;
  }

  private Add(items: any[]) {
    items.forEach(c => {
      if (!(c.Name && c.Source)) {
        throw `Missing Name or Source: Couldn't import ${JSON.stringify(c)}`;
      }
      c.Id = createId(c.Name, c.Source);
      this.items[c.Id] = c;
      const listing: ServerListing = {
        Name: c.Name,
        Id: c.Id,
        Path: c.Path || "",
        SearchHint: this.getKeywords(c),
        Link: this.route + c.Id
      };
      this.listings.push(listing);
    });
  }

  public GetById(id: string): TItem {
    return this.items[id];
  }

  public GetListings(): ServerListing[] {
    return this.listings;
  }

  public Route = () => this.route;
}
