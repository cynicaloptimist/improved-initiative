import { Listing, ListingOrigin } from "../Library/Listing";
import { LegacySynchronousLocalStore } from "../Utility/LegacySynchronousLocalStore";
import { Store } from "../Utility/Store";
import { getUnsyncedItemsFromListings } from "./AccountClient";

async function fakeListing(
  id: string,
  name: string,
  listingOrigin: ListingOrigin
) {
  const listing = new Listing(
    {
      Id: id,
      Name: name,
      Link: "Test",
      Metadata: {},
      Path: "",
      SearchHint: ""
    },
    listingOrigin
  );
  if (listingOrigin == "localStorage") {
    LegacySynchronousLocalStore.Save("Test", id, { Id: id, Name: name });
  }
  if (listingOrigin == "localAsync") {
    await Store.Save("Test", id, { Id: id, Name: name });
  }
  return listing;
}

describe("getUnsyncedItemsFromListings", () => {
  test("Should find unsynced local items", async () => {
    const localListing = await fakeListing("item1", "Unsynced", "localStorage");
    const remoteListing = await fakeListing("item2", "Synced", "account");
    const unsyncedItems = await getUnsyncedItemsFromListings([
      localListing,
      remoteListing
    ]);
    expect(unsyncedItems).toEqual([
      {
        Id: "item1",
        Name: "Unsynced",
        Path: "",
        Version: "legacy"
      }
    ]);
  });

  test("Should find unsynced localAsync items", async () => {
    const localListing = await fakeListing("item1", "Unsynced", "localAsync");
    const remoteListing = await fakeListing("item2", "Synced", "account");
    const unsyncedItems = await getUnsyncedItemsFromListings([
      localListing,
      remoteListing
    ]);
    expect(unsyncedItems).toEqual([
      {
        Id: "item1",
        Name: "Unsynced",
        Path: "",
        Version: "legacy"
      }
    ]);
  });
});
