import { Listing, ServerListing, ListingOrigin } from "./Listing";
import { Spell } from "../Spell/Spell";
import { Store } from "../Utility/Store";
import { AccountClient } from "../Account/AccountClient";

export class SpellLibrary {
    public Spells = ko.observableArray<Listing<Spell>>([]);
    public SpellsByNameRegex = ko.computed(() => {
        const allSpellNames = this.Spells().map(s => s.Name);
        if (allSpellNames.length === 0) {
            return new RegExp("a^");
        }
        return new RegExp(`\\b(${allSpellNames.join("|")})\\b`, "gim");
    });

    constructor() {
        $.ajax("../spells/").done(listings => this.AddListings(listings, "server"));

        const customSpells = Store.List(Store.Spells);
        customSpells.forEach(id => {
            var spell = { ...Spell.Default(), ...Store.Load<Spell>(Store.Spells, id) };
            this.Spells.push(new Listing<Spell>(id, spell.Name, Spell.GetKeywords(spell), Store.Spells, "localStorage"));
        });
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
