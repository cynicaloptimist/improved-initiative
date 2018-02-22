import * as _ from "lodash";
import { AccountClient } from "../Account/AccountClient";
import { Spell } from "../Spell/Spell";
import { Store } from "../Utility/Store";
import { Listing, ListingOrigin, ServerListing } from "./Listing";

export class SpellLibrary {
    public Spells = ko.observableArray<Listing<Spell>>([]);
    public SpellsByNameRegex = ko.computed(() => {
        const allSpellNames = this.Spells().map(s => _.escapeRegExp(s.Name));
        if (allSpellNames.length === 0) {
            return new RegExp("a^");
        }
        return new RegExp(`\\b(${allSpellNames.join("|")})\\b`, "gim");
    });

    constructor() {
        $.ajax("../spells/").done(listings => this.AddListings(listings, "server"));

        const customSpells = Store.List(Store.Spells);
        const newListings = customSpells.map(id => {
            let spell = { ...Spell.Default(), ...Store.Load<Spell>(Store.Spells, id) };
            return new Listing<Spell>(id, spell.Name, Spell.GetKeywords(spell), Store.Spells, "localStorage");
        });

        ko.utils.arrayPushAll(this.Spells, newListings);
    }

    public AddListings = (listings: ServerListing[], source: ListingOrigin) => {
        ko.utils.arrayPushAll<Listing<Spell>>(this.Spells, listings.map(c => {
            return new Listing<Spell>(c.Id, c.Name, c.SearchHint, c.Link, source);
        }));
    }

    public AddOrUpdateSpell = (spell: Spell) => {
        this.Spells.remove(listing => listing.Id === spell.Id);
        spell.Id = AccountClient.SanitizeForId(spell.Id);
        const listing = new Listing<Spell>(spell.Id, spell.Name, Spell.GetKeywords(spell), Store.Spells, "localStorage", spell);
        this.Spells.push(listing);
        Store.Save(Store.Spells, spell.Id, spell);
        new AccountClient().SaveSpell(spell)
            .then(r => {
                if (!r) return;
                if (listing.Origin === "account") return;
                const accountListing = new Listing<Spell>(spell.Id, spell.Name, Spell.GetKeywords(spell), `/my/spells/${spell.Id}`, "account", spell);
                this.Spells.push(accountListing);
            });
    }

    public DeleteSpellById = (id: string) => {
        this.Spells.remove(listing => listing.Id === id);
        Store.Delete(Store.Spells, id);
        new AccountClient().DeleteSpell(id);
    }
}
