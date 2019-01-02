import * as ko from "knockout";

import { Listable } from "../../common/Listable";
import { Store } from "../Utility/Store";

export type ListingOrigin = "server" | "account" | "localStorage";

export class Listing<T extends Listable> {
  constructor(
    public Id: string,
    private Name: string,
    public Path: string,
    public SearchHint: string,
    public Link: string,
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
      const item = Store.Load<T>(this.Link, this.Id);
      item.Id = this.Id;

      if (item !== null) {
        this.value(item);
        return callback(item);
      } else {
        console.error(
          `Couldn't load item keyed '${this.Id}' from localStorage.`
        );
      }
    }

    return $.getJSON(this.Link).done(item => {
      item.Id = this.Id;
      this.value(item);
      return callback(item);
    });
  }

  public CurrentName = ko.computed(() => {
    const current = this.value();
    if (current !== undefined) {
      return current.Name || this.Name;
    }
    return this.Name;
  });
}
