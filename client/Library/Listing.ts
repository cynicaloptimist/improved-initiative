import * as ko from "knockout";

import { Listable, StoredListing } from "../../common/Listable";
import { Store } from "../Utility/Store";

export type ListingOrigin = "server" | "account" | "localStorage";

export class Listing<T extends Listable> {
  constructor(
    private storedListing: StoredListing,
    public Origin: ListingOrigin,
    value?: T
  ) {
    if (value) {
      this.value(value);
    }
  }

  private value = ko.observable<T>();

  public SetValue = value => this.value(value);

  public GetWithTemplate(template: T) {
    return new Promise<T>(done => {
      return this.GetAsyncWithUpdatedId(item => {
        const templateCast = template as object;
        const finalListable = {
          ...templateCast,
          ...item
        } as T;
        return done(finalListable);
      });
    });
  }

  public GetAsyncWithUpdatedId(callback: (item: {}) => any) {
    if (this.value()) {
      return callback(this.value());
    }

    if (this.Origin === "localStorage") {
      const item = Store.Load<T>(
        this.storedListing.Link,
        this.storedListing.Id
      );
      item.Id = this.storedListing.Id;

      if (item !== null) {
        this.value(item);
        return callback(item);
      } else {
        console.error(
          `Couldn't load item keyed '${
            this.storedListing.Id
          }' from localStorage.`
        );
      }
    }

    return $.getJSON(this.storedListing.Link).done(item => {
      item.Id = this.storedListing.Id;
      this.value(item);
      return callback(item);
    });
  }

  public Listing = ko.pureComputed<StoredListing>(() => {
    const current = this.value();
    if (current !== undefined) {
      return {
        Id: current.Id,
        Name: current.Name,
        Path: current.Path || "",
        Link: this.storedListing.Link,
        SearchHint: this.storedListing.SearchHint,
        Metadata: this.storedListing.Metadata
      };
    }
    return this.storedListing;
  });
}
