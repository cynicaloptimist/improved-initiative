module ImprovedInitiative {
    export type ListingSource = "server" | "account" | "localStorage";

    export function DedupeByRankAndFilterListings<T extends Listing<any>>(parentSubset: T[], filter: string) {
        const byName: T[] = [];
        const bySearchHint: T[] = [];
        const dedupedStatBlocks: KeyValueSet<T> = {};
        const sourceRankings: ListingSource[] = ["account", "localStorage", "server"];

        parentSubset.forEach(newListing => {
            const currentListing = dedupedStatBlocks[newListing.Name];
            if (currentListing) {
                const hasBetterSource = (sourceRankings.indexOf(newListing.Source) < sourceRankings.indexOf(currentListing.Source));
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

    export interface Listing<T extends { Name?: string }> {
        Value: KnockoutObservable<T>;
        Id: string;
        Link: string;
        Name: string;
        Source: ListingSource;
        SearchHint: string;
    }

    export class Listing<T extends { Name?: string }> {
        constructor(
            public Id: string,
            public Name: string,
            public SearchHint: string,
            public Link: string,
            public Source: ListingSource,
            value?: T
        ) {
            if (value) {
                this.Value(value);
            }
        }

        Value = ko.observable<T>();

        GetAsync(callback: (item: T) => void) {
            if (this.Value()) {
                return callback(this.Value());
            }

            if (this.Source === "localStorage") {
                return callback(Store.Load(this.Link, this.Id));
            }

            $.getJSON(this.Link).done(item => {
                this.Value(item);
                callback(this.Value());
            });

        }

        CurrentName = ko.computed(() => {
            const current = this.Value();
            if (current !== undefined) {
                return current.Name || this.Name;
            }
            return this.Name;
        })
    }
}