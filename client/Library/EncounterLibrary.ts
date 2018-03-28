import { ServerListing } from "../../common/Listable";
import { AccountClient } from "../Account/AccountClient";
import { SavedCombatant, SavedEncounter } from "../Encounter/SavedEncounter";
import { UpdateLegacySavedEncounter } from "../Encounter/UpdateLegacySavedEncounter";
import { Store } from "../Utility/Store";
import { Listing, ListingOrigin } from "./Listing";

export class EncounterLibrary {
    public Encounters = ko.observableArray<Listing<SavedEncounter<SavedCombatant>>>([]);

    constructor() {
        const listings = Store.LoadAllAndUpdateIds(Store.SavedEncounters)
            .map(e => {
                const encounter = UpdateLegacySavedEncounter(e);
                return this.listingFrom(encounter, "localStorage");
            });
        ko.utils.arrayPushAll(this.Encounters, listings);
    }

    private listingFrom(savedEncounter: SavedEncounter<SavedCombatant>, origin: ListingOrigin) {
        const listingId = savedEncounter.Id;
        const combatantNames = savedEncounter.Combatants.map(c => c.Alias).join(" ");

        let link = Store.SavedEncounters;
        if (origin == "account") {
            link = `/my/encounters/${savedEncounter.Id}`;
        }

        return new Listing<SavedEncounter<SavedCombatant>>(
            listingId,
            savedEncounter.Name,
            savedEncounter.Path,
            combatantNames,
            link,
            origin);
    }

    public AddListings(listings: ServerListing[], source: ListingOrigin) {
        ko.utils.arrayPushAll<Listing<SavedEncounter<SavedCombatant>>>(
            this.Encounters,
            listings.map(l => new Listing(l.Id, l.Name, l.Path, l.SearchHint, l.Link, source))
        );
    }

    public SaveOrUpdate = (savedEncounter: SavedEncounter<SavedCombatant>, encounterId: string) => {
        this.Encounters.remove(l => l.Id == savedEncounter.Id);

        savedEncounter.Id = encounterId;
        const listing = this.listingFrom(savedEncounter, "localStorage");
        this.Encounters.push(listing);

        Store.Save(Store.SavedEncounters, encounterId, savedEncounter);

        new AccountClient().SaveEncounter(savedEncounter)
            .then(r => {
                if (!r) {
                    return;
                }
                const accountListing = this.listingFrom(savedEncounter, "account");
                this.Encounters.push(accountListing);
            });

    }

    public Delete = (listing: Listing<SavedEncounter<SavedCombatant>>) => {
        this.Encounters.remove(l => l.Id == listing.Id);
        new AccountClient().DeleteEncounter(listing.Id);
        Store.Delete(Store.SavedEncounters, listing.Id);
    }
}


