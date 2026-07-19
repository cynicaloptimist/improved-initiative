import { act, renderHook } from "@testing-library/react-hooks";
import { SavedEncounter } from "../../common/SavedEncounter";
import { Store } from "../Utility/Store";
import { useLibrary } from "./useLibrary";

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

  function renderSavedEncounterLibrary() {
    return renderHook(() =>
      useLibrary(Store.SavedEncounters, "encounters", {
        createEmptyListing: SavedEncounter.Default,
        accountSave: () => undefined,
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
});
