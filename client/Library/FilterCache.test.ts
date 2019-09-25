import { StatBlock } from "../../common/StatBlock";
import { FilterCache } from "./FilterCache";
import { Listing } from "./Listing";

function makeStatBlockListing(partialStatblock: Partial<StatBlock>) {
  const statBlock = {
    ...StatBlock.Default(),
    ...partialStatblock
  };
  const listing = new Listing<StatBlock>(
    {
      ...statBlock,
      SearchHint: StatBlock.GetSearchHint(statBlock),
      Metadata: StatBlock.GetMetadata(statBlock),
      Link: "/",
      LastUpdateMs: 0
    },
    "localAsync"
  );

  return listing;
}

describe("FilterCache", () => {
  test("GetFilteredEntries", () => {
    const filterCache = new FilterCache<Listing<StatBlock>>([
      makeStatBlockListing({ Name: "Goblin" }),
      makeStatBlockListing({ Name: "Troll" })
    ]);

    const results = filterCache.GetFilteredEntries("goblin");

    expect(results.map(l => l.Listing().Name)).toEqual(["Goblin"]);
  });
});
