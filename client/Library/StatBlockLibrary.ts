import * as ko from "knockout";

import { StoredListing } from "../../common/Listable";
import { StatBlock } from "../../common/StatBlock";
import { AccountClient } from "../Account/AccountClient";
import { Store } from "../Utility/Store";
import { Listing, ListingOrigin } from "./Listing";

export class StatBlockLibrary {
  private statBlocks = ko.observableArray<Listing<StatBlock>>([]);
  private readonly StoreName = Store.StatBlocks;

  public GetStatBlocks = ko.pureComputed(() => this.statBlocks());

  constructor(private accountClient: AccountClient) {}

  public AddListings = (listings: StoredListing[], source: ListingOrigin) => {
    ko.utils.arrayPushAll<Listing<StatBlock>>(
      this.statBlocks,
      listings.map(c => {
        return new Listing<StatBlock>(c, source);
      })
    );
  };

  public DeleteListing = (id: string) => {
    this.statBlocks.remove(s => s.Listing().Id == id);
    Store.Delete(this.StoreName, id);
    this.accountClient.DeleteStatBlock(id);
  };

  private saveStatBlock = (
    listing: Listing<StatBlock>,
    newStatBlock: StatBlock
  ) => {
    listing.Listing().Id = newStatBlock.Id;
    this.statBlocks.push(listing);

    Store.Save<StatBlock>(this.StoreName, newStatBlock.Id, newStatBlock);
    listing.SetValue(newStatBlock);

    this.accountClient.SaveStatBlock(newStatBlock).then(r => {
      if (!r || listing.Origin === "account") {
        return;
      }
      const accountListing = new Listing<StatBlock>(
        {
          ...newStatBlock,
          SearchHint: StatBlock.GetSearchHint(newStatBlock),
          Metadata: StatBlock.GetMetadata(newStatBlock),
          Link: `/my/statblocks/${newStatBlock.Id}`
        },
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
        l.Listing().Id == listing.Listing().Id ||
        l.Listing().Path + l.Listing().Name ==
          listing.Listing().Path + listing.Listing().Name
    );
    for (const statBlock of oldStatBlocks) {
      this.DeleteListing(statBlock.Listing().Id);
    }
    this.saveStatBlock(listing, newStatBlock);
  };

  public SaveNewStatBlock = (newStatBlock: StatBlock) => {
    const oldStatBlocks = this.GetStatBlocks().filter(
      l =>
        l.Listing().Path + l.Listing().Name ==
        newStatBlock.Path + newStatBlock.Name
    );
    for (const statBlock of oldStatBlocks) {
      this.DeleteListing(statBlock.Listing().Id);
    }

    const listing = new Listing<StatBlock>(
      {
        ...newStatBlock,
        SearchHint: StatBlock.GetSearchHint(newStatBlock),
        Metadata: StatBlock.GetMetadata(newStatBlock),
        Link: this.StoreName
      },
      "localStorage"
    );
    this.saveStatBlock(listing, newStatBlock);
  };
}
