import { PCLibrary } from "./PCLibrary";
import { NPCLibrary } from "./NPCLibrary";
import { EncounterLibrary } from "./EncounterLibrary";
import { SpellLibrary } from "./SpellLibrary";

export class Libraries {
    public PCs = new PCLibrary();
    public NPCs = new NPCLibrary();
    public Encounters = new EncounterLibrary();
    public Spells = new SpellLibrary();
}
