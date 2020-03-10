import { Listable } from "../../common/Listable";
import { KeyValueSet } from "../../common/Toolbox";
import { Listing, ListingOrigin } from "./Listing";

function DedupeByRankAndFilterListings<T extends Listing<Listable>>(
  parentSubset: T[],
  filter: string
) {
  const byName: T[] = [];
  const bySearchHint: T[] = [];
  const dedupedItems: KeyValueSet<T> = {};
  const sourceRankings: ListingOrigin[] = [
    "account",
    "localAsync",
    "localStorage",
    "server"
  ];

  parentSubset.forEach(listing => {
    const storedListing = listing.Listing();

    const dedupeKey = `${storedListing.Path}-${storedListing.Name}`.toLocaleLowerCase();

    if (dedupedItems[dedupeKey] == undefined) {
      dedupedItems[dedupeKey] = listing;
      return;
    }

    const currentListing = dedupedItems[dedupeKey];

    const isNewer =
      storedListing.LastUpdateMs > currentListing.Listing().LastUpdateMs;
    const hasBetterSource =
      sourceRankings.indexOf(listing.Origin) <
      sourceRankings.indexOf(currentListing.Origin);
    if (isNewer || hasBetterSource) {
      dedupedItems[dedupeKey] = listing;
    }
  });

  Object.keys(dedupedItems)
    .sort()
    .forEach(i => {
      const listing = dedupedItems[i];
      if (
        listing
          .Listing()
          .Name.toLocaleLowerCase()
          .indexOf(filter) > -1
      ) {
        byName.push(listing);
      } else if (
        listing
          .Listing()
          .SearchHint.toLocaleLowerCase()
          .indexOf(filter) > -1
      ) {
        bySearchHint.push(listing);
      }
    });

  return byName.concat(bySearchHint);
}

export class FilterCache<T extends Listing<Listable>> {
  private allItems: T[];
  private initialLength: number;
  constructor(initialItems: T[]) {
    this.initializeItems(initialItems);
  }

  private filterCache: KeyValueSet<T[]> = {};

  public UpdateIfItemsChanged(newItems) {
    if (newItems.length != this.initialLength) {
      this.filterCache = {};
      this.initializeItems(newItems);
    }
  }

  public GetFilteredEntries = (filter: string) => {
    if (this.filterCache[filter]) {
      return this.filterCache[filter];
    }

    const parentSubset =
      this.filterCache[filter.substr(0, filter.length - 1)] || this.allItems;

    const finalList = DedupeByRankAndFilterListings(parentSubset, filter);

    this.filterCache[filter] = finalList;

    return finalList;
  };

  private initializeItems(items: T[]) {
    this.initialLength = items.length;
    this.allItems = items.filter(i => {
      if (!i.Listing().Name?.length) {
        console.warn("Removing unnamed statblock: " + JSON.stringify(i));
        return false;
      }
      return true;
    });
  }
}
