import * as ko from "knockout";

import moment = require("moment");
import { FilterDimensions, Listable, ListingMeta } from "../../common/Listable";
import { Store } from "../Utility/Store";
import { Listing, ListingOrigin } from "./Listing";

export class Library<T extends Listable> {
  private listings = ko.observableArray<Listing<T>>([]);

  public GetListings = ko.pureComputed(() => this.listings());

  constructor(
    private storeName: string,
    private callbacks: {
      accountSave: (listable: T) => any;
      accountDelete: (listableId: string) => any;
      getSearchHint: (listable: T) => string;
      getFilterDimensions: (listable: T) => FilterDimensions;
    }
  ) {}

  public AddListings = (listings: ListingMeta[], source: ListingOrigin) => {
    ko.utils.arrayPushAll<Listing<T>>(
      this.listings,
      listings.map(c => {
        return new Listing<T>(c, source);
      })
    );
  };

  public DeleteListing = async (id: string) => {
    this.listings.remove(s => s.Meta().Id == id);
    await Store.Delete(this.storeName, id);
    try {
      await this.callbacks.accountDelete(id);
    } catch {}
  };

  private saveListing = async (listing: Listing<T>, newListable: T) => {
    newListable.LastUpdateMs = moment.now();
    listing.Meta().Id = newListable.Id;
    this.listings.push(listing);

    await Store.Save<T>(this.storeName, newListable.Id, newListable);
    listing.SetValue(newListable);

    const saveResult = await this.callbacks.accountSave(newListable);
    if (!saveResult || listing.Origin === "account") {
      return;
    }
    const accountListing = new Listing<T>(
      {
        ...newListable,
        SearchHint: this.callbacks.getSearchHint(newListable),
        FilterDimensions: this.callbacks.getFilterDimensions(newListable),
        Link: `/my/statblocks/${newListable.Id}`,
        LastUpdateMs: moment.now()
      },
      "account",
      newListable
    );
    this.listings.push(accountListing);
  };

  public SaveEditedListing = async (listing: Listing<T>, newListable: T) => {
    const oldListings = this.GetListings().filter(
      l =>
        l.Meta().Id == listing.Meta().Id ||
        l.Meta().Path + l.Meta().Name ==
          listing.Meta().Path + listing.Meta().Name
    );
    for (const listing of oldListings) {
      await this.DeleteListing(listing.Meta().Id);
    }
    await this.saveListing(listing, newListable);
  };

  public SaveNewListing = async (newListable: T) => {
    const oldStatBlocks = this.GetListings().filter(
      l =>
        l.Origin === "localAsync" &&
        l.Meta().Path + l.Meta().Name == newListable.Path + newListable.Name
    );
    const listing = new Listing<T>(
      {
        ...newListable,
        SearchHint: this.callbacks.getSearchHint(newListable),
        FilterDimensions: this.callbacks.getFilterDimensions(newListable),
        Link: this.storeName,
        LastUpdateMs: moment.now()
      },
      "localAsync"
    );
    await this.saveListing(listing, newListable);

    for (const statBlock of oldStatBlocks) {
      await this.DeleteListing(statBlock.Meta().Id);
    }
  };
}

