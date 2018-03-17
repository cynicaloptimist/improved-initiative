import { Listable, ServerListing } from "../../common/Listable";
import { Store } from "../Utility/Store";

export type ListingOrigin = "server" | "account" | "localStorage";

export class Listing<T extends Listable> implements ServerListing {
    constructor(
        public Id: string,
        public Name: string,
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

    public GetAsync(callback: (item: T) => any) {
        if (this.value()) {
            return callback(this.value());
        }

        if (this.Origin === "localStorage") {
            const item = Store.Load<T>(this.Link, this.Id);

            if (item !== null) {
                return callback(item);
            } else {
                console.error(`Couldn't load item keyed '${this.Id}' from localStorage.`);
            }
        }

        return $.getJSON(this.Link).done(item => {
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
