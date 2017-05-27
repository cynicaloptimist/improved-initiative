import { PCLibrary } from "./PCLibrary";
import { NPCLibrary } from "./NPCLibrary";
import { EncounterLibrary } from "./EncounterLibrary";
import { SpellLibrary } from "./SpellLibrary";

export class Libraries {
    PCs = new PCLibrary();
    NPCs = new NPCLibrary();
    Encounters = new EncounterLibrary();
    Spells = new SpellLibrary();
}
