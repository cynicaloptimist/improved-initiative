import * as ko from "knockout";

import { CombatantState } from "../../common/CombatantState";
import { EncounterState, SavedEncounter } from "../../common/EncounterState";
import { StoredListing } from "../../common/Listable";
import { AccountClient } from "../Account/AccountClient";
import { UpdateLegacySavedEncounter } from "../Encounter/UpdateLegacySavedEncounter";
import { Store } from "../Utility/Store";
import { Listing, ListingOrigin } from "./Listing";

export class EncounterLibrary {
  public Encounters = ko.observableArray<Listing<SavedEncounter>>([]);

  constructor(private accountClient: AccountClient) {
    const listings = Store.LoadAllAndUpdateIds(Store.SavedEncounters).map(e => {
      const encounter = UpdateLegacySavedEncounter(e);
      return this.listingFrom(encounter, "localStorage");
    });
    ko.utils.arrayPushAll(this.Encounters, listings);
  }

  private listingFrom(encounterState: SavedEncounter, origin: ListingOrigin) {
    let link = Store.SavedEncounters;
    if (origin == "account") {
      link = `/my/encounters/${encounterState.Id}`;
    }

    return new Listing<SavedEncounter>(
      {
        ...encounterState,
        SearchHint: SavedEncounter.GetSearchHint(encounterState),
        Metadata: {},
        Link: link
      },
      origin
    );
  }

  public AddListings(listings: StoredListing[], source: ListingOrigin) {
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
    const listing = this.listingFrom(savedEncounter, "localStorage");
    this.Encounters.remove(l => l.Listing().Id == listing.Listing().Id);
    this.Encounters.push(listing);

    Store.Save(Store.SavedEncounters, savedEncounter.Id, savedEncounter);

    this.accountClient.SaveEncounter(savedEncounter).then(r => {
      if (!r) {
        return;
      }
      const accountListing = this.listingFrom(savedEncounter, "account");
      this.Encounters.push(accountListing);
    });
  };

  public Delete = (listing: Listing<SavedEncounter>) => {
    this.deleteById(listing.Listing().Id);
  };

  private deleteById = (listingId: string) => {
    this.Encounters.remove(l => l.Listing().Id == listingId);
    this.accountClient.DeleteEncounter(listingId);
    Store.Delete(Store.SavedEncounters, listingId);
  };
}
