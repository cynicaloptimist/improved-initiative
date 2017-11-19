import { Listing, ServerListing, ListingOrigin } from "./Listing";
import { SavedEncounter, SavedCombatant } from "../Encounter/SavedEncounter";
import { Store } from "../Utility/Store";
import { Metrics } from "../Utility/Metrics";
import { AccountClient } from "../Account/AccountClient";
import { probablyUniqueString } from "../Utility/Toolbox";

export class EncounterLibrary {
    Encounters = ko.observableArray<Listing<SavedEncounter<SavedCombatant>>>([]);

    constructor() {
        Store.List(Store.SavedEncounters).forEach(e => {
            const encounter = SavedEncounter.UpdateLegacySavedEncounter(Store.Load<SavedEncounter<SavedCombatant>>(Store.SavedEncounters, e));
            const listing = listingFrom(encounter, e);
            this.Encounters.push(listing);
        });

        Metrics.TrackEvent("SavedEncounters", { Count: this.Encounters().length.toString() });
    }

    AddListings(listings: ServerListing[], source: ListingOrigin) {
        ko.utils.arrayPushAll<Listing<SavedEncounter<SavedCombatant>>>(
            this.Encounters,
            listings.map(l => new Listing(l.Id, l.Name, l.SearchHint, l.Link, source))
        );
    }

    Save = (savedEncounter: SavedEncounter<SavedCombatant>) => {
        const listing = listingFrom(savedEncounter);

        if (this.Encounters().indexOf(listing) === -1) {
            this.Encounters.push(listing);
        }
        Store.Save(Store.SavedEncounters, listing.Id, savedEncounter);

        new AccountClient().SaveEncounter(savedEncounter)
            .then(r => {
                if (!r) return;
                const accountListing = listingFrom(savedEncounter, listing.Id);
                accountListing.Origin = "account";
                accountListing.Link = `/my/encounters/${accountListing.Id}`;
                this.Encounters.push(accountListing);
            });

    }

    Delete = (listing: Listing<SavedEncounter<SavedCombatant>>) => {
        this.Encounters.remove(l => l.Id == listing.Id);
        new AccountClient().DeleteEncounter(listing.Id);
        Store.Delete(Store.SavedEncounters, listing.Id);
    }
}

function listingFrom(savedEncounter: SavedEncounter<SavedCombatant>, encounterId?: string) {
    const listingId = encounterId || probablyUniqueString();
    const combatantNames = savedEncounter.Combatants.map(c => c.Alias).join(" ");
    return new Listing<SavedEncounter<SavedCombatant>>(
        listingId,
        savedEncounter.Name,
        combatantNames,
        Store.SavedEncounters,
        'localStorage');
}
