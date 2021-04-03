import * as ko from "knockout";

import moment = require("moment");
import { ListingMeta } from "../../common/Listable";
import { StatBlock } from "../../common/StatBlock";
import { AccountClient } from "../Account/AccountClient";
import { Store } from "../Utility/Store";
import { Listing, ListingOrigin } from "./Listing";

export class StatBlockLibrary {
  private statBlocks = ko.observableArray<Listing<StatBlock>>([]);
  private readonly StoreName = Store.StatBlocks;

  public GetStatBlocks = ko.pureComputed(() => this.statBlocks());

  constructor(private accountClient: AccountClient) {}

  public AddListings = (listings: ListingMeta[], source: ListingOrigin) => {
    ko.utils.arrayPushAll<Listing<StatBlock>>(
      this.statBlocks,
      listings.map(c => {
        return new Listing<StatBlock>(c, source);
      })
    );
  };

  public DeleteListing = async (id: string) => {
    this.statBlocks.remove(s => s.Meta().Id == id);
    await Store.Delete(this.StoreName, id);
    try {
      await this.accountClient.DeleteStatBlock(id);
    } catch {}
  };

  private saveStatBlock = async (
    listing: Listing<StatBlock>,
    newStatBlock: StatBlock
  ) => {
    newStatBlock.LastUpdateMs = moment.now();
    listing.Meta().Id = newStatBlock.Id;
    this.statBlocks.push(listing);

    await Store.Save<StatBlock>(this.StoreName, newStatBlock.Id, newStatBlock);
    listing.SetValue(newStatBlock);

    const saveResult = await this.accountClient.SaveStatBlock(newStatBlock);
    if (!saveResult || listing.Origin === "account") {
      return;
    }
    const accountListing = new Listing<StatBlock>(
      {
        ...newStatBlock,
        SearchHint: StatBlock.GetSearchHint(newStatBlock),
        FilterDimensions: StatBlock.FilterDimensions(newStatBlock),
        Link: `/my/statblocks/${newStatBlock.Id}`,
        LastUpdateMs: moment.now()
      },
      "account",
      newStatBlock
    );
    this.statBlocks.push(accountListing);
  };

  public SaveEditedStatBlock = async (
    listing: Listing<StatBlock>,
    newStatBlock: StatBlock
  ) => {
    const oldStatBlocks = this.GetStatBlocks().filter(
      l =>
        l.Meta().Id == listing.Meta().Id ||
        l.Meta().Path + l.Meta().Name ==
          listing.Meta().Path + listing.Meta().Name
    );
    for (const statBlock of oldStatBlocks) {
      await this.DeleteListing(statBlock.Meta().Id);
    }
    await this.saveStatBlock(listing, newStatBlock);
  };

  public SaveNewStatBlock = async (newStatBlock: StatBlock) => {
    const oldStatBlocks = this.GetStatBlocks().filter(
      l =>
        l.Origin === "localAsync" &&
        l.Meta().Path + l.Meta().Name ==
          newStatBlock.Path + newStatBlock.Name
    );
    const listing = new Listing<StatBlock>(
      {
        ...newStatBlock,
        SearchHint: StatBlock.GetSearchHint(newStatBlock),
        FilterDimensions: StatBlock.FilterDimensions(newStatBlock),
        Link: this.StoreName,
        LastUpdateMs: moment.now()
      },
      "localAsync"
    );
    await this.saveStatBlock(listing, newStatBlock);

    for (const statBlock of oldStatBlocks) {
      await this.DeleteListing(statBlock.Meta().Id);
    }
  };
}
