import { EncounterLibrary } from "./EncounterLibrary";
import { NPCLibrary } from "./NPCLibrary";
import { PCLibrary } from "./PCLibrary";
import { SpellLibrary } from "./SpellLibrary";

export class Libraries {
    public PCs = new PCLibrary();
    public NPCs = new NPCLibrary();
    public Encounters = new EncounterLibrary();
    public Spells = new SpellLibrary();
}
