import * as ko from "knockout";

import moment = require("moment");
import { FilterDimensions, Listable, ListingMeta } from "../../common/Listable";
import { probablyUniqueString } from "../../common/Toolbox";
import { LegacySynchronousLocalStore } from "../Utility/LegacySynchronousLocalStore";
import { Store } from "../Utility/Store";
import { Listing, ListingOrigin } from "./Listing";

export class Library<T extends Listable> {
  private listings = ko.observableArray<Listing<T>>([]);

  public GetListings = ko.pureComputed(() => this.listings());

  constructor(
    private storeName: string,
    private accountRoute: string,
    private create: () => T,
    private callbacks: {
      accountSave: (listable: T) => any;
      accountDelete: (listableId: string) => any;
      getSearchHint: (listable: T) => string;
      getFilterDimensions: (listable: T) => FilterDimensions;
    }
  ) {
    Store.LoadAllAndUpdateIds(storeName).then(async storedListables => {
      if (storedListables.length > 0) {
        const listings = storedListables.map(this.makeListing);
        this.AddListings(listings, "localAsync");
      } else {
        const legacyListings = await LegacySynchronousLocalStore.LoadAllAndUpdateIds(
          storeName
        );
        const listings = legacyListings.map(this.makeListing);
        this.AddListings(listings, "localStorage");
      }
    });
  }

  private makeListing = (listable: T) => {
    const { Name, Path, Id, LastUpdateMs } = { ...listable };
    const listing: ListingMeta = {
      Name,
      Path,
      Id,
      LastUpdateMs,
      SearchHint: this.callbacks.getSearchHint(listable),
      FilterDimensions: this.callbacks.getFilterDimensions(listable),
      Link: this.storeName
    };
    return listing;
  };

  public AddListings = (listings: ListingMeta[], source: ListingOrigin) => {
    ko.utils.arrayPushAll<Listing<T>>(
      this.listings,
      listings.map(c => {
        return new Listing<T>(c, source);
      })
    );
  };

  public async GetOrCreateListingById(listingId: string): Promise<Listing<T>> {
    const template: T = {
      ...this.create(),
      Id: listingId
    };
    const currentListing = this.listings().find(l => l.Meta().Id === listingId);
    if (currentListing) {
      return currentListing;
    }
    const newListing = await this.SaveNewListing(template);
    return newListing;
  }

  public async GetItemById(listingId: string): Promise<T> {
    const item = await this.GetOrCreateListingById(listingId);
    return await item.GetWithTemplate(this.create());
  }

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
      return listing;
    }
    const accountListing = new Listing<T>(
      {
        ...newListable,
        SearchHint: this.callbacks.getSearchHint(newListable),
        FilterDimensions: this.callbacks.getFilterDimensions(newListable),
        Link: `/my/${this.accountRoute}/${newListable.Id}`,
        LastUpdateMs: moment.now()
      },
      "account",
      newListable
    );
    this.listings.push(accountListing);

    return listing;
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
    if (listing.Origin === "server") {
      newListable.Id = probablyUniqueString();
    }
    await this.saveListing(listing, newListable);
  };

  public SaveNewListing = async (newListable: T) => {
    const oldListings = this.GetListings().filter(
      l =>
        l.Origin === "localAsync" &&
        l.Meta().Path + l.Meta().Name == newListable.Path + newListable.Name
    );
    const listing = new Listing<T>(
      {
        Id: newListable.Id || probablyUniqueString(),
        Path: newListable.Path,
        Name: newListable.Name,
        SearchHint: this.callbacks.getSearchHint(newListable),
        FilterDimensions: this.callbacks.getFilterDimensions(newListable),
        Link: this.storeName,
        LastUpdateMs: moment.now()
      },
      "localAsync"
    );
    const savedListing = await this.saveListing(listing, newListable);

    for (const listing of oldListings) {
      await this.DeleteListing(listing.Meta().Id);
    }

    return savedListing;
  };
}
