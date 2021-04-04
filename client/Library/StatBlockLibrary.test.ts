import { StatBlock } from "../../common/StatBlock";
import { AccountClient } from "../Account/AccountClient";
import { Store } from "../Utility/Store";
import { StatBlockLibrary } from "./StatBlockLibrary";

describe("StatBlock Library", () => {
  test("", async done => {
    localStorage.clear();

    await Store.Save(Store.StatBlocks, "creatureId", {
      ...StatBlock.Default(),
      Name: "Saved Creature",
      HP: { Value: 10 }
    });

    const library = new StatBlockLibrary(new AccountClient());
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

    const listing = library.GetStatBlocks()[0];
    const statBlockFromLibrary = await listing.GetWithTemplate(
      StatBlock.Default()
    );

    expect(statBlockFromLibrary.Name).toEqual("Saved Creature");
    expect(statBlockFromLibrary.HP.Value).toEqual(10);

    done();
  });
});
