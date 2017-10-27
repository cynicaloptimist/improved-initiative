module ImprovedInitiative {
    export class SpellLibrary {
        Spells = ko.observableArray<Listing<Spell>>([]);
        SpellsByNameRegex = ko.computed(() => {
            const allSpellNames = this.Spells().map(s => s.Name);
            if (allSpellNames.length === 0) {
                return new RegExp('a^');
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

            Metrics.TrackEvent("CustomSpells", { Count: customSpells.length.toString() });
        }

        AddListings = (listings: ServerListing[], source: ListingOrigin) => {
            ko.utils.arrayPushAll<Listing<Spell>>(this.Spells, listings.map(c => {
                return new Listing<Spell>(c.Id, c.Name, c.SearchHint, c.Link, source);
            }));
        }

        public AddOrUpdateSpell = (spell: Spell) => {
            this.Spells.remove(listing => listing.Origin === "localStorage" && listing.Id === spell.Id);
            const listing = new Listing<Spell>(spell.Id, spell.Name, Spell.GetKeywords(spell), Store.Spells, "localStorage", spell);
            this.Spells.unshift(listing);
            Store.Save(Store.Spells, spell.Id, spell);
            new AccountClient().SaveSpell(spell);
        }

        public DeleteSpellById = (id: string) => {
            this.Spells.remove(listing => listing.Id === id);
            Store.Delete(Store.Spells, id);
            new AccountClient().DeleteSpell(id);
        }
    }
}