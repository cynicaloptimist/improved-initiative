import moment = require("moment");
import React = require("react");
import { FilterDimensions, Listable, ListingMeta } from "../../common/Listable";
import { probablyUniqueString } from "../../common/Toolbox";
import { Store } from "../Utility/Store";
import { Listing, ListingOrigin } from "./Listing";

export interface Library<T extends Listable> {
  AddListings: (
    newListingMetas: ListingMeta[],
    source: ListingOrigin,
    mapLinkResponse?: (statBlockData: any) => T
  ) => void;
  DeleteListing: (id: string) => Promise<void>;
  SaveNewListing: (newListable: T) => Promise<Listing<T>>;
  SaveEditedListing: (
    listing: Listing<T>,
    newListable: T
  ) => Promise<Listing<T>>;
  GetOrCreateListingById: (listingId: string) => Promise<Listing<T>>;
  GetAllListings: () => Listing<T>[];
}

export function useLibrary<T extends Listable>(
  storeName: string,
  accountRoute: string,
  callbacks: {
    createEmptyListing: () => T;
    accountSave: (listable: T) => any;
    accountDelete: (listableId: string) => any;
    getSearchHint: (listable: T) => string;
    getFilterDimensions: (listable: T) => FilterDimensions;
    loadingFinished?: (storeName: string, count: number) => void;
  }
): Library<T> {
  // locals
  const [listings, setListings] = React.useState<Listing<T>[]>([]);

  const addListing = React.useCallback(
    newListing =>
      setListings(currentListings => {
        return [...currentListings, newListing];
      }),
    [setListings]
  );

  const saveListing = useSaveListing<T>(
    addListing,
    storeName,
    accountRoute,
    callbacks
  );

  const makeListing = React.useCallback(
    (listable: T) => {
      const { Name, Path, Id, LastUpdateMs } = { ...listable };
      const listing: ListingMeta = {
        Name,
        Path,
        Id,
        LastUpdateMs,
        SearchHint: callbacks.getSearchHint(listable),
        FilterDimensions: callbacks.getFilterDimensions(listable),
        Link: storeName
      };
      return listing;
    },
    [storeName, callbacks.getSearchHint, callbacks.getFilterDimensions]
  );

  //exported

  const AddListings = React.useCallback(
    (
      newListingMetas: ListingMeta[],
      source: ListingOrigin,
      mapLinkResponse?: (statBlockData: any) => T
    ) => {
      setListings(currentListings => [
        ...currentListings,
        ...newListingMetas.map(
          m => new Listing<T>(m, source, undefined, mapLinkResponse)
        )
      ]);
    },
    [setListings]
  );

  const DeleteListing = React.useCallback(
    async (id: string) => {
      setListings(currentListings =>
        currentListings.filter(s => s.Meta().Id !== id)
      );
      await Store.Delete(storeName, id);
      try {
        await callbacks.accountDelete(id);
      } catch {}
    },
    [listings, setListings, storeName, callbacks.accountDelete]
  );

  const SaveNewListing = React.useCallback(
    async (newListable: T) => {
      const listingsToOverwrite = listings.filter(
        l =>
          (l.Origin === "localAsync" || l.Origin === "localStorage") &&
          l.Meta().Path == newListable.Path &&
          l.Meta().Name == newListable.Name
      );

      const listing = new Listing<T>(
        {
          Id: newListable.Id || probablyUniqueString(),
          Path: newListable.Path,
          Name: newListable.Name,
          SearchHint: callbacks.getSearchHint(newListable),
          FilterDimensions: callbacks.getFilterDimensions(newListable),
          Link: storeName,
          LastUpdateMs: moment.now()
        },
        "localAsync"
      );

      const savedListing = await saveListing(listing, newListable);

      for (const listingToOverwrite of listingsToOverwrite) {
        await DeleteListing(listingToOverwrite.Meta().Id);
      }

      return savedListing;
    },
    [listings]
  );

  const SaveEditedListing = React.useCallback(
    async (listing: Listing<T>, newListable: T) => {
      const listingsToOverwrite = listings.filter(
        l =>
          l.Meta().Id == listing.Meta().Id ||
          l.Meta().Path + l.Meta().Name ==
            listing.Meta().Path + listing.Meta().Name
      );

      for (const listingToOverwrite of listingsToOverwrite) {
        if (listingToOverwrite.Origin === "account") {
          try {
            await DeleteListing(listingToOverwrite.Meta().Id);
          } catch {}
        }
      }

      if (listing.Origin === "server") {
        newListable.Id = probablyUniqueString();
      }

      return await saveListing(listing, newListable);
    },
    [listings, DeleteListing, saveListing]
  );

  const GetOrCreateListingById = React.useCallback(
    async (listingId: string) => {
      const template: T = {
        ...callbacks.createEmptyListing(),
        Id: listingId
      };
      const currentListing = listings.find(l => l.Meta().Id === listingId);

      if (currentListing) {
        return currentListing;
      }

      const newListing = await SaveNewListing(template);
      return newListing;
    },
    [callbacks.createEmptyListing, listings, SaveNewListing]
  );

  const GetAllListings = React.useCallback(() => [...listings], [listings]);

  // Effects
  if (callbacks.loadingFinished) {
    React.useEffect(
      () => callbacks.loadingFinished(storeName, listings.length),
      [callbacks.loadingFinished, listings]
    );
  }

  React.useEffect(() => {
    Store.LoadAllAndUpdateIds(storeName).then(async storedListables => {
      if (storedListables.length > 0) {
        const listings = storedListables.map(makeListing);
        AddListings(listings, "localAsync");
      }
    });
  }, [storeName]);

  return {
    AddListings,
    DeleteListing,
    SaveNewListing,
    SaveEditedListing,
    GetOrCreateListingById,
    GetAllListings
  } as const;
}

function useSaveListing<T extends Listable>(
  addListing: (newListing: any) => void,
  storeName: string,
  accountRoute: string,
  callbacks: {
    createEmptyListing: () => T;
    accountSave: (listable: T) => any;
    accountDelete: (listableId: string) => any;
    getSearchHint: (listable: T) => string;
    getFilterDimensions: (listable: T) => FilterDimensions;
    loadingFinished?: (storeName: string, count: number) => void;
  }
) {
  return React.useCallback(
    async (listing: Listing<T>, newListable: T) => {
      newListable.LastUpdateMs = moment.now();
      listing.Meta().Id = newListable.Id;

      addListing(listing);

      await Store.Save<T>(storeName, newListable.Id, newListable);
      listing.SetValue(newListable);

      const saveResult = await callbacks.accountSave(newListable);
      if (!saveResult || listing.Origin === "account") {
        return listing;
      }

      const accountListing = new Listing<T>(
        {
          ...newListable,
          SearchHint: callbacks.getSearchHint(newListable),
          FilterDimensions: callbacks.getFilterDimensions(newListable),
          Link: `/my/${accountRoute}/${newListable.Id}`,
          LastUpdateMs: moment.now()
        },
        "account",
        newListable
      );

      addListing(accountListing);

      return listing;
    },
    [
      addListing,
      storeName,
      accountRoute,
      callbacks.getSearchHint,
      callbacks.getFilterDimensions
    ]
  );
}
