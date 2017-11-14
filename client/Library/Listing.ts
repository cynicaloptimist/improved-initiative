import { Store } from "../Utility/Store";

export type ListingOrigin = "server" | "account" | "localStorage";

export function DedupeByRankAndFilterListings<T extends Listing<Listable>>(parentSubset: T[], filter: string) {
    const byName: T[] = [];
    const bySearchHint: T[] = [];
    const dedupedStatBlocks: KeyValueSet<T> = {};
    const sourceRankings: ListingOrigin[] = ["account", "localStorage", "server"];

    parentSubset.forEach(newListing => {
        const currentListing = dedupedStatBlocks[newListing.Name];
        if (currentListing) {
            const hasBetterSource = (sourceRankings.indexOf(newListing.Origin) < sourceRankings.indexOf(currentListing.Origin));
            if (hasBetterSource) {
                dedupedStatBlocks[newListing.Name] = newListing;
            }
        } else {
            dedupedStatBlocks[newListing.Name] = newListing;
        }
    })

    Object.keys(dedupedStatBlocks).sort().forEach(i => {
        const listing = dedupedStatBlocks[i];
        if (listing.Name.toLocaleLowerCase().indexOf(filter) > -1) {
            byName.push(listing);
        }
        else if (listing.SearchHint.toLocaleLowerCase().indexOf(filter) > -1) {
            bySearchHint.push(listing);
        }
    });

    return byName.concat(bySearchHint);
}

export interface ServerListing {
    Id: string;
    Link: string;
    Name: string;
    SearchHint: string;
}

export interface Listable {
    Id: string;
    Version: string;
    Name: string;
}

export interface Listing<T extends Listable> {
    Id: string;
    Link: string;
    Name: string;
    Origin: ListingOrigin;
    SearchHint: string;
}

export class Listing<T extends Listable> {
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

    SetValue = value => this.value(value);

    GetAsync(callback: (item: T) => any) {
        if (this.value()) {
            return callback(this.value());
        }

        if (this.Origin === "localStorage") {
            return callback(Store.Load(this.Link, this.Id));
        }

        return $.getJSON(this.Link).done(item => {
            this.value(item);
            return callback(item);
        });
    }

    CurrentName = ko.computed(() => {
        const current = this.value();
        if (current !== undefined) {
            return current.Name || this.Name;
        }
        return this.Name;
    })
}
