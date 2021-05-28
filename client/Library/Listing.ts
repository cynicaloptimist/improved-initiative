import * as ko from "knockout";

import _ = require("lodash");
import { Listable, ListingMeta } from "../../common/Listable";
import { LegacySynchronousLocalStore } from "../Utility/LegacySynchronousLocalStore";
import { Store } from "../Utility/Store";

export type ListingOrigin =
  | "server"
  | "account"
  | "localAsync"
  | "localStorage";

export class Listing<T extends Listable> {
  constructor(
    private listingMeta: ListingMeta,
    public Origin: ListingOrigin,
    value?: T
  ) {
    if (value) {
      this.value(value);
    }
  }

  private value = ko.observable<T>();

  public SetValue = (value: T) => this.value(value);

  public GetWithTemplate(template: T) {
    return new Promise<T>(done => {
      return this.GetAsyncWithUpdatedId(item => {
        return done(_.merge(template, item));
      });
    });
  }

  public GetAsyncWithUpdatedId(callback: (item: {}) => any) {
    if (this.value()) {
      return callback(this.value());
    }

    if (this.Origin === "localAsync") {
      return Store.Load(this.listingMeta.Link, this.listingMeta.Id)
        .then(callback)
        .catch(err =>
          console.error(
            `Couldn't load item keyed '${this.listingMeta.Id}' from async localForage store:\n\n${err}`
          )
        );
    }

    if (this.Origin === "localStorage") {
      const item = LegacySynchronousLocalStore.Load<T>(
        this.listingMeta.Link,
        this.listingMeta.Id
      );

      if (item !== null) {
        item.Id = this.listingMeta.Id;
        this.value(item);
        return callback(item);
      } else {
        console.error(
          `Couldn't load item keyed '${this.listingMeta.Id}' from localStorage.`
        );
        return null;
      }
    }

    return $.getJSON(this.listingMeta.Link).done(item => {
      item.Id = this.listingMeta.Id;
      this.value(item);
      return callback(item);
    });
  }

  public Meta = ko.pureComputed<ListingMeta>(() => {
    const current = this.value();
    if (current !== undefined) {
      return {
        Id: current.Id,
        Name: current.Name,
        Path: current.Path || "",
        Link: this.listingMeta.Link,
        SearchHint: this.listingMeta.SearchHint,
        FilterDimensions: this.listingMeta.FilterDimensions,
        LastUpdateMs: current.LastUpdateMs || 0
      };
    }
    return this.listingMeta;
  });
}
