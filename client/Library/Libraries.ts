import { AccountClient } from "../Account/AccountClient";
import { EncounterLibrary } from "./EncounterLibrary";
import { NPCLibrary } from "./NPCLibrary";
import { PCLibrary } from "./PCLibrary";
import { SpellLibrary } from "./SpellLibrary";

export class Libraries {
    public PCs: PCLibrary;
    public NPCs: NPCLibrary;
    public Encounters: EncounterLibrary;
    public Spells: SpellLibrary;

    constructor(private accountClient: AccountClient) {
        this.PCs = new PCLibrary(accountClient);
        this.NPCs = new NPCLibrary(accountClient);
        this.Encounters = new EncounterLibrary(accountClient);
        this.Spells = new SpellLibrary(accountClient);
    }
}
