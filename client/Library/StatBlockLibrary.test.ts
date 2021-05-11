import { StatBlock } from "../../common/StatBlock";
import { Store } from "../Utility/Store";
import { Library } from "./Library";

describe("StatBlock Library", () => {
  test("", async done => {
    localStorage.clear();

    await Store.Save(Store.StatBlocks, "creatureId", {
      ...StatBlock.Default(),
      Name: "Saved Creature",
      HP: { Value: 10 }
    });

    const library = new Library(
      Store.StatBlocks,
      "statblocks",
      () => StatBlock.Default(),
      {
        accountSave: () => {},
        accountDelete: () => {},
        getFilterDimensions: () => ({}),
        getSearchHint: () => ""
      }
    );
    library.AddListings(
      [
        {
          Name: "Saved Creature",
          Id: "creatureId",
          Link: Store.StatBlocks,
          Path: "",
          FilterDimensions: {},
          SearchHint: "",
          LastUpdateMs: 0
        }
      ],
      "localAsync"
    );

    const listing = library.GetListings()[0];
    const statBlockFromLibrary = await listing.GetWithTemplate(
      StatBlock.Default()
    );

    expect(statBlockFromLibrary.Name).toEqual("Saved Creature");
    expect(statBlockFromLibrary.HP.Value).toEqual(10);

    done();
  });
});
