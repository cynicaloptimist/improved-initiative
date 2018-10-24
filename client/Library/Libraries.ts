import * as ko from "knockout";

import { Spell } from "../../common/Spell";
import { AccountClient } from "../Account/AccountClient";
import { Store } from "../Utility/Store";
import { EncounterLibrary } from "./EncounterLibrary";
import { Listing } from "./Listing";
import { NPCLibrary } from "./NPCLibrary";
import { PCLibrary } from "./PCLibrary";
import { PersistentCharacterLibrary } from "./PersistentCharacterLibrary";
import { SpellLibrary } from "./SpellLibrary";

export class Libraries {
    public PCs: PCLibrary;
    public PersistentCharacters: PersistentCharacterLibrary;
    public NPCs: NPCLibrary;
    public Encounters: EncounterLibrary;
    public Spells: SpellLibrary;

    private initializeSpells = () => {
        $.ajax("../spells/").done(listings => this.Spells.AddListings(listings, "server"));

        const customSpells = Store.List(Store.Spells);
        const newListings = customSpells.map(id => {
            let spell = { ...Spell.Default(), ...Store.Load<Spell>(Store.Spells, id) };
            return new Listing<Spell>(id, spell.Name, spell.Path, Spell.GetKeywords(spell), Store.Spells, "localStorage");
        });

        ko.utils.arrayPushAll(this.Spells.Spells, newListings);
    }

    constructor(accountClient: AccountClient) {
        this.PCs = new PCLibrary(accountClient);
        this.PersistentCharacters = new PersistentCharacterLibrary();
        this.NPCs = new NPCLibrary(accountClient);
        this.Encounters = new EncounterLibrary(accountClient);
        this.Spells = new SpellLibrary(accountClient);
        
        this.initializeSpells();
    }
}
