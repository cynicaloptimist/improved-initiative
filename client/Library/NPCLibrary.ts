import * as ko from "knockout";

import { ServerListing } from "../../common/Listable";
import { StatBlock } from "../../common/StatBlock";
import { AccountClient } from "../Account/AccountClient";
import { Store } from "../Utility/Store";
import { Listing, ListingOrigin } from "./Listing";

export class NPCLibrary {
  private statBlocks = ko.observableArray<Listing<StatBlock>>([]);
  private readonly StoreName = Store.StatBlocks;

  public GetStatBlocks = ko.computed(() => this.statBlocks());

  constructor(private accountClient: AccountClient) {}

  public AddListings = (listings: ServerListing[], source: ListingOrigin) => {
    ko.utils.arrayPushAll<Listing<StatBlock>>(
      this.statBlocks,
      listings.map(c => {
        return new Listing<StatBlock>(
          c.Id,
          c.Name,
          c.Path,
          c.SearchHint,
          c.Link,
          source
        );
      })
    );
  };

  public DeleteListing = (id: string) => {
    this.statBlocks.remove(s => s.Id == id);
    Store.Delete(this.StoreName, id);
    this.accountClient.DeleteStatBlock(id);
  };

  private saveStatBlock = (
    listing: Listing<StatBlock>,
    newStatBlock: StatBlock
  ) => {
    listing.Id = newStatBlock.Id;
    this.statBlocks.push(listing);

    Store.Save<StatBlock>(this.StoreName, newStatBlock.Id, newStatBlock);
    listing.SetValue(newStatBlock);

    this.accountClient.SaveStatBlock(newStatBlock).then(r => {
      if (!r || listing.Origin === "account") {
        return;
      }
      const accountListing = new Listing<StatBlock>(
        newStatBlock.Id,
        newStatBlock.Name,
        newStatBlock.Path,
        newStatBlock.Type,
        `/my/statblocks/${newStatBlock.Id}`,
        "account",
        newStatBlock
      );
      this.statBlocks.push(accountListing);
    });
  };

  public SaveEditedStatBlock = (
    listing: Listing<StatBlock>,
    newStatBlock: StatBlock
  ) => {
    const oldStatBlocks = this.GetStatBlocks().filter(
      l =>
        l.Id == listing.Id ||
        l.CurrentPath() + l.CurrentName() ==
          listing.CurrentPath() + listing.CurrentName()
    );
    for (const statBlock of oldStatBlocks) {
      this.DeleteListing(statBlock.Id);
    }
    this.saveStatBlock(listing, newStatBlock);
  };

  public SaveNewStatBlock = (newStatBlock: StatBlock) => {
    const listing = new Listing<StatBlock>(
      newStatBlock.Id,
      newStatBlock.Name,
      newStatBlock.Path,
      newStatBlock.Type,
      this.StoreName,
      "localStorage"
    );
    this.saveStatBlock(listing, newStatBlock);
  };
}
