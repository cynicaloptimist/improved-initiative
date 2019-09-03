import { StatBlock } from "../../common/StatBlock";
import { AccountClient } from "../Account/AccountClient";
import { LegacySynchronousLocalStore } from "../Utility/LegacySynchronousLocalStore";
import { StatBlockLibrary } from "./StatBlockLibrary";

describe("StatBlock Library", () => {
  test("", async done => {
    localStorage.clear();

    LegacySynchronousLocalStore.Save(
      LegacySynchronousLocalStore.StatBlocks,
      "creatureId",
      {
        ...StatBlock.Default(),
        Name: "Saved Creature",
        HP: { Value: 10 }
      }
    );

    const library = new StatBlockLibrary(new AccountClient());
    library.AddListings(
      [
        {
          Name: "Saved Creature",
          Id: "creatureId",
          Link: LegacySynchronousLocalStore.StatBlocks,
          Path: "",
          Metadata: {},
          SearchHint: ""
        }
      ],
      "localStorage"
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
