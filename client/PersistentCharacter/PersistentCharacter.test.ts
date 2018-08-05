import { InitializeCharacter } from "../../common/PersistentCharacter";
import { StatBlock } from "../../common/StatBlock";

describe("InitializeCharacter", () => {
    it("Should have the current HP of the provided statblock", () => {
        const statBlock = StatBlock.Default();
        statBlock.HP.Value = 10;
        const character = InitializeCharacter(statBlock);
        expect(character.CurrentHP).toBe(10);
    });
});

describe("PersistentCharacterLibrary", () => {
    it("Should create new PersistentCharacters for existing PlayerCharacter statblocks");

    it("Should not create duplicate PersistentCharacters for already converted PlayerCharacters");
});

describe("PersistentCharacter", () => {
    it("SavedCombatants should load their CurrentHP from the Character");

    it("Should allow the user to save notes");
    
    it("Should update the Character when a linked Combatant's hp changes");
    
    it("Should update the statblock when it is edited from the library");
    
    it("Should update the statblock when it is edited from the combatant");
    
    it("Should render combatant notes with markdown");
});
