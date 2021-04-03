import * as ko from "knockout";

import moment = require("moment");
import { ListingMeta } from "../../common/Listable";
import { SavedEncounter } from "../../common/SavedEncounter";
import { AccountClient } from "../Account/AccountClient";
import { UpdateLegacySavedEncounter } from "../Encounter/UpdateLegacySavedEncounter";
import { LegacySynchronousLocalStore } from "../Utility/LegacySynchronousLocalStore";
import { Listing, ListingOrigin } from "./Listing";

export class EncounterLibrary {
  public Encounters = ko.observableArray<Listing<SavedEncounter>>([]);

  constructor(private accountClient: AccountClient) {
    const listings = LegacySynchronousLocalStore.LoadAllAndUpdateIds(
      LegacySynchronousLocalStore.SavedEncounters
    ).map(e => {
      const encounter = UpdateLegacySavedEncounter(e);
      return this.listingFrom(encounter, "localStorage");
    });
    ko.utils.arrayPushAll(this.Encounters, listings);
  }

  private listingFrom(encounterState: SavedEncounter, origin: ListingOrigin) {
    let link = LegacySynchronousLocalStore.SavedEncounters;
    if (origin == "account") {
      link = `/my/encounters/${encounterState.Id}`;
    }

    return new Listing<SavedEncounter>(
      {
        ...encounterState,
        SearchHint: SavedEncounter.GetSearchHint(encounterState),
        FilterDimensions: {},
        Link: link,
        LastUpdateMs: encounterState.LastUpdateMs || 0
      },
      origin
    );
  }

  public AddListings(listings: ListingMeta[], source: ListingOrigin) {
    ko.utils.arrayPushAll<Listing<SavedEncounter>>(
      this.Encounters,
      listings.map(l => new Listing(l, source))
    );
  }

  public Move = (savedEncounter: SavedEncounter, oldEncounterId: string) => {
    this.deleteById(oldEncounterId);

    this.Save(savedEncounter);
  };

  public Save = (savedEncounter: SavedEncounter) => {
    savedEncounter.LastUpdateMs = moment.now();
    const listing = this.listingFrom(savedEncounter, "localStorage");
    this.Encounters.remove(l => l.Meta().Id == listing.Meta().Id);
    this.Encounters.push(listing);

    LegacySynchronousLocalStore.Save(
      LegacySynchronousLocalStore.SavedEncounters,
      savedEncounter.Id,
      savedEncounter
    );

    this.accountClient.SaveEncounter(savedEncounter).then(r => {
      if (!r) {
        return;
      }
      const accountListing = this.listingFrom(savedEncounter, "account");
      this.Encounters.push(accountListing);
    });
  };

  public Delete = (listing: Listing<SavedEncounter>) => {
    this.deleteById(listing.Meta().Id);
  };

  private deleteById = (listingId: string) => {
    this.Encounters.remove(l => l.Meta().Id == listingId);
    this.accountClient.DeleteEncounter(listingId);
    LegacySynchronousLocalStore.Delete(
      LegacySynchronousLocalStore.SavedEncounters,
      listingId
    );
  };
}
