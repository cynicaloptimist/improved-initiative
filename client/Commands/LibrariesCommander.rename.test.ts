import * as ko from "knockout";
import { SavedEncounter } from "../../common/SavedEncounter";
import { Listing } from "../Library/Listing";
import { LibrariesCommander } from "./LibrariesCommander";

function buildListing(id: string, name: string, path: string) {
  const encounter: SavedEncounter = {
    ...SavedEncounter.Default(),
    Id: id,
    Name: name,
    Path: path
  };
  return new Listing<SavedEncounter>(
    {
      Id: id,
      Name: name,
      Path: path,
      Link: "",
      SearchHint: "",
      FilterDimensions: {},
      LastUpdateMs: 0
    },
    "localAsync",
    encounter
  );
}

function setup(
  listings: Listing<SavedEncounter>[],
  defaults: { Name: string; Path: string } | null = null,
  updateSucceeded = true
) {
  const SaveEncounterDefaults = ko.observable(defaults);
  const UpdateListings = jest.fn(async updates => {
    for (const update of updates) {
      update.listing.SetValue(update.value);
    }
    if (!updateSucceeded) {
      throw new Error("Could not update listings.");
    }
  });
  const library = {
    GetAllListings: () => listings,
    UpdateListings
  };
  const commander = new LibrariesCommander(
    { Encounter: { SaveEncounterDefaults } } as any,
    null as any
  );
  commander.SetLibraries({ Encounters: library } as any);

  return { commander, SaveEncounterDefaults, UpdateListings };
}

describe("LibrariesCommander encounter rename", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("renames an encounter and updates matching save defaults", async () => {
    const source = buildListing("source-id", "Goblin Ambush", "Chapter 1");
    const { commander, SaveEncounterDefaults, UpdateListings } = setup(
      [source],
      { Name: "Goblin Ambush", Path: "Chapter 1" }
    );

    const result = await commander.RenameEncounter(source, "Finale");

    expect(result).toEqual({ success: true });
    expect(UpdateListings).toHaveBeenCalledWith([
      {
        listing: source,
        value: expect.objectContaining({
          Id: "source-id",
          Name: "Finale",
          Path: "Chapter 1"
        })
      }
    ]);
    expect(SaveEncounterDefaults()).toEqual({
      Name: "Finale",
      Path: "Chapter 1"
    });
  });

  test("rejects an encounter collision without writes", async () => {
    const source = buildListing("source-id", "Goblin Ambush", "Chapter 1");
    const target = buildListing("target-id", "Finale", "Chapter 1");
    const { commander, SaveEncounterDefaults, UpdateListings } = setup(
      [source, target],
      { Name: "Goblin Ambush", Path: "Chapter 1" }
    );

    const result = await commander.RenameEncounter(source, "Finale");

    expect(result).toEqual({
      success: false,
      error: expect.any(String)
    });
    expect(UpdateListings).not.toHaveBeenCalled();
    expect(SaveEncounterDefaults()).toEqual({
      Name: "Goblin Ambush",
      Path: "Chapter 1"
    });
  });

  test("rejects an empty encounter name without writes", async () => {
    const source = buildListing("source-id", "Goblin Ambush", "Chapter 1");
    const { commander, UpdateListings } = setup([source]);

    const result = await commander.RenameEncounter(source, "   ");

    expect(result).toEqual({
      success: false,
      error: expect.any(String)
    });
    expect(UpdateListings).not.toHaveBeenCalled();
  });

  test("accepts an unchanged encounter name without writes", async () => {
    const source = buildListing("source-id", "Goblin Ambush", "Chapter 1");
    const { commander, UpdateListings } = setup([source]);

    const result = await commander.RenameEncounter(source, "  Goblin Ambush  ");

    expect(result).toEqual({ success: true });
    expect(UpdateListings).not.toHaveBeenCalled();
  });

  test("reports a failed encounter update and leaves defaults unchanged", async () => {
    const consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const source = buildListing("source-id", "Goblin Ambush", "Chapter 1");
    const { commander, SaveEncounterDefaults } = setup(
      [source],
      { Name: "Goblin Ambush", Path: "Chapter 1" },
      false
    );

    const result = await commander.RenameEncounter(source, "Finale");

    expect(result).toEqual({
      success: false,
      error: expect.any(String)
    });
    expect(SaveEncounterDefaults()).toEqual({
      Name: "Goblin Ambush",
      Path: "Chapter 1"
    });
    expect(consoleError).toHaveBeenCalledTimes(1);
  });

  test("renames a complete folder subtree and updates save defaults", async () => {
    const first = buildListing("first", "Ambush", "Campaign/Act One");
    const second = buildListing("second", "Finale", "Campaign/Act One/Deep");
    const unrelated = buildListing("other", "Tavern", "Campaign/Side Quest");
    const { commander, SaveEncounterDefaults, UpdateListings } = setup(
      [first, second, unrelated],
      { Name: "Finale", Path: "Campaign/Act One/Deep" }
    );

    const result = await commander.RenameEncounterFolder(
      "Campaign/Act One",
      "Act 1"
    );

    expect(result).toEqual({ success: true });
    expect(UpdateListings).toHaveBeenCalledWith([
      {
        listing: first,
        value: expect.objectContaining({ Path: "Campaign/Act 1" })
      },
      {
        listing: second,
        value: expect.objectContaining({ Path: "Campaign/Act 1/Deep" })
      }
    ]);
    expect(SaveEncounterDefaults()).toEqual({
      Name: "Finale",
      Path: "Campaign/Act 1/Deep"
    });
  });

  test("rejects a folder collision without writes", async () => {
    const source = buildListing("source", "Ambush", "Campaign/Act One");
    const target = buildListing("target", "Finale", "Campaign/Act Two/Deep");
    const { commander, UpdateListings } = setup([source, target]);

    const result = await commander.RenameEncounterFolder(
      "Campaign/Act One",
      "Act Two"
    );

    expect(result).toEqual({
      success: false,
      error: expect.any(String)
    });
    expect(UpdateListings).not.toHaveBeenCalled();
  });

  test("rejects a slash in a folder name without writes", async () => {
    const source = buildListing("source", "Ambush", "Campaign/Act One");
    const { commander, UpdateListings } = setup([source]);

    const result = await commander.RenameEncounterFolder(
      "Campaign/Act One",
      "Act/One"
    );

    expect(result).toEqual({
      success: false,
      error: expect.any(String)
    });
    expect(UpdateListings).not.toHaveBeenCalled();
  });

  test("rejects an empty folder name without writes", async () => {
    const source = buildListing("source", "Ambush", "Campaign/Act One");
    const { commander, UpdateListings } = setup([source]);

    const result = await commander.RenameEncounterFolder(
      "Campaign/Act One",
      "   "
    );

    expect(result).toEqual({
      success: false,
      error: expect.any(String)
    });
    expect(UpdateListings).not.toHaveBeenCalled();
  });

  test("accepts an unchanged folder name without writes", async () => {
    const source = buildListing("source", "Ambush", "Campaign/Act One");
    const { commander, UpdateListings } = setup([source]);

    const result = await commander.RenameEncounterFolder(
      "Campaign/Act One",
      "  Act One  "
    );

    expect(result).toEqual({ success: true });
    expect(UpdateListings).not.toHaveBeenCalled();
  });
});
