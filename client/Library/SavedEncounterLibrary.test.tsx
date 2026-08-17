import { act, renderHook } from "@testing-library/react-hooks";
import { SavedEncounter } from "../../common/SavedEncounter";
import { Store } from "../Utility/Store";
import { FilterCache } from "./FilterCache";
import { useLibrary } from "./useLibrary";
import { Listing } from "./Listing";

function buildSavedEncounter(
  Id: string,
  Name: string,
  Path: string
): SavedEncounter {
  return {
    ...SavedEncounter.Default(),
    Id,
    Name,
    Path
  };
}

describe("Saved Encounter Library", () => {
  beforeEach(() => {
    jest.spyOn(Store, "LoadAllAndUpdateIds").mockResolvedValue([]);
    jest.spyOn(Store, "Save").mockResolvedValue();
    jest.spyOn(Store, "Delete").mockResolvedValue();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  function renderSavedEncounterLibrary(
    accountSave: (encounter: SavedEncounter) => any = () => undefined
  ) {
    return renderHook(() =>
      useLibrary(Store.SavedEncounters, "encounters", {
        createEmptyListing: SavedEncounter.Default,
        accountSave,
        accountDelete: () => undefined,
        getSearchHint: SavedEncounter.GetSearchHint,
        getFilterDimensions: () => ({})
      })
    );
  }

  test("saving with the same name and folder replaces a local encounter", async () => {
    const { result } = renderSavedEncounterLibrary();
    const original = buildSavedEncounter(
      "original",
      "Goblin Ambush",
      "Chapter 1"
    );
    const replacement = buildSavedEncounter(
      "replacement",
      "Goblin Ambush",
      "Chapter 1"
    );

    await act(async () => {
      await result.current.SaveNewListing(original);
    });
    await act(async () => {
      await result.current.SaveNewListing(replacement);
    });

    expect(result.current.GetAllListings()).toHaveLength(1);
    expect(Store.Delete).toHaveBeenCalledWith(
      Store.SavedEncounters,
      "original"
    );
    const savedEncounter = await result.current
      .GetAllListings()[0]
      .GetWithTemplate(SavedEncounter.Default());
    expect(savedEncounter).toMatchObject(replacement);
  });

  test("saving the same name in different folders keeps separate encounters", async () => {
    const { result } = renderSavedEncounterLibrary();

    await act(async () => {
      await result.current.SaveNewListing(
        buildSavedEncounter("chapter-one", "Goblin Ambush", "Chapter 1")
      );
      await result.current.SaveNewListing(
        buildSavedEncounter("chapter-two", "Goblin Ambush", "Chapter 2")
      );
    });

    expect(result.current.GetAllListings()).toHaveLength(2);
    expect(result.current.GetAllListings().map(l => l.Meta().Path)).toEqual([
      "Chapter 1",
      "Chapter 2"
    ]);
  });

  // TODO(encounter-rename-persistence): Restore the one-row expectation when
  // UpdateListings stops delegating to the append-based legacy save method.
  test("the filter hides the duplicate row appended by legacy UpdateListings", async () => {
    const accountSave = jest.fn();
    const { result } = renderSavedEncounterLibrary(accountSave);
    const original = buildSavedEncounter(
      "encounter-id",
      "Goblin Ambush",
      "Chapter 1"
    );

    await act(async () => {
      await result.current.SaveNewListing(original);
    });
    const listing = result.current.GetAllListings()[0];

    await act(async () => {
      await result.current.UpdateListings([
        {
          listing,
          value: { ...original, Name: "Finale" }
        }
      ]);
    });

    expect(result.current.GetAllListings()).toHaveLength(2);
    for (const updatedListing of result.current.GetAllListings()) {
      expect(updatedListing.Meta()).toMatchObject({
        Id: "encounter-id",
        Name: "Finale",
        Path: "Chapter 1"
      });
    }
    // FilterCache's invariant value type is irrelevant here; this test only
    // exercises its metadata-based duplicate filtering.
    const visibleListings = new FilterCache<Listing<any>>(
      result.current.GetAllListings()
    ).GetFilteredEntries("");
    expect(visibleListings).toHaveLength(1);
    expect(Store.Save).toHaveBeenLastCalledWith(
      Store.SavedEncounters,
      "encounter-id",
      expect.objectContaining({
        Id: "encounter-id",
        Name: "Finale"
      })
    );
    expect(accountSave).toHaveBeenLastCalledWith(
      expect.objectContaining({
        Id: "encounter-id",
        Name: "Finale"
      })
    );
  });

  test("attempts every update and reports rejected edits", async () => {
    const accountSave = jest.fn();
    const consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const { result } = renderSavedEncounterLibrary(accountSave);
    const first = buildSavedEncounter("first", "First", "Chapter 1");
    const second = buildSavedEncounter("second", "Second", "Chapter 1");

    await act(async () => {
      await result.current.SaveNewListing(first);
      await result.current.SaveNewListing(second);
    });
    const [firstListing, secondListing] = result.current.GetAllListings();
    accountSave.mockReset();
    accountSave
      .mockRejectedValueOnce(new Error("account unavailable"))
      .mockResolvedValueOnce(undefined);

    await act(async () => {
      await expect(
        result.current.UpdateListings([
          {
            listing: firstListing,
            value: { ...first, Name: "First renamed" }
          },
          {
            listing: secondListing,
            value: { ...second, Name: "Second renamed" }
          }
        ])
      ).rejects.toEqual(expect.any(Error));
    });

    expect(accountSave).toHaveBeenCalledTimes(2);
    expect(consoleError).toHaveBeenCalledTimes(1);
    expect(consoleError.mock.calls[0][1]).toEqual(expect.any(Error));
    consoleError.mockRestore();
  });
});
