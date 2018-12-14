import * as ko from "knockout";

import { CombatantState } from "../../common/CombatantState";
import { EncounterState } from "../../common/EncounterState";
import { ServerListing } from "../../common/Listable";
import { AccountClient } from "../Account/AccountClient";
import { UpdateLegacySavedEncounter } from "../Encounter/UpdateLegacySavedEncounter";
import { Store } from "../Utility/Store";
import { Listing, ListingOrigin } from "./Listing";

export class EncounterLibrary {
    public Encounters = ko.observableArray<Listing<EncounterState<CombatantState>>>([]);

    constructor(private accountClient: AccountClient) {
        const listings = Store.LoadAllAndUpdateIds(Store.SavedEncounters)
            .map(e => {
                const encounter = UpdateLegacySavedEncounter(e);
                return this.listingFrom(encounter, "localStorage");
            });
        ko.utils.arrayPushAll(this.Encounters, listings);
    }

    private listingFrom(savedEncounter: EncounterState<CombatantState>, origin: ListingOrigin) {
        const listingId = savedEncounter.Id;
        const combatantNames = savedEncounter.Combatants.map(c => c.Alias).join(" ");

        let link = Store.SavedEncounters;
        if (origin == "account") {
            link = `/my/encounters/${savedEncounter.Id}`;
        }

        return new Listing<EncounterState<CombatantState>>(
            listingId,
            savedEncounter.Name,
            savedEncounter.Path,
            combatantNames,
            link,
            origin);
    }

    public AddListings(listings: ServerListing[], source: ListingOrigin) {
        ko.utils.arrayPushAll<Listing<EncounterState<CombatantState>>>(
            this.Encounters,
            listings.map(l => new Listing(l.Id, l.Name, l.Path, l.SearchHint, l.Link, source))
        );
    }

    public Move = (savedEncounter: EncounterState<CombatantState>, oldEncounterId: string) => {
        this.deleteById(oldEncounterId);

        this.Save(savedEncounter);
    }

    public Save = (savedEncounter: EncounterState<CombatantState>) => {
        const listing = this.listingFrom(savedEncounter, "localStorage");
        this.Encounters.push(listing);

        Store.Save(Store.SavedEncounters, savedEncounter.Id, savedEncounter);

        this.accountClient.SaveEncounter(savedEncounter)
            .then(r => {
                if (!r) {
                    return;
                }
                const accountListing = this.listingFrom(savedEncounter, "account");
                this.Encounters.push(accountListing);
            });

    }

    public Delete = (listing: Listing<EncounterState<CombatantState>>) => {
        this.deleteById(listing.Id);
    }

    private deleteById = (listingId: string) => {
        this.Encounters.remove(l => l.Id == listingId);
        this.accountClient.DeleteEncounter(listingId);
        Store.Delete(Store.SavedEncounters, listingId);
    }
}


