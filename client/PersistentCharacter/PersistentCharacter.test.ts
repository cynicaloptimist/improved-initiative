import { DefaultPersistentCharacter, InitializeCharacter } from "../../common/PersistentCharacter";
import { StatBlock } from "../../common/StatBlock";
import { PersistentCharacterLibrary } from "../Library/PersistentCharacterLibrary";
import { Store } from "../Utility/Store";

beforeEach(() => {
    localStorage.clear();
});

describe("InitializeCharacter", () => {
    it("Should have the current HP of the provided statblock", () => {
        const statBlock = StatBlock.Default();
        statBlock.HP.Value = 10;
        const character = InitializeCharacter(statBlock);
        expect(character.CurrentHP).toBe(10);
    });
});

describe("PersistentCharacterLibrary", () => {
    it("Should load stored PersistentCharacters", () => {
        const persistentCharacter = DefaultPersistentCharacter();
        Store.Save(Store.PersistentCharacters, persistentCharacter.Id, persistentCharacter);
        const library = new PersistentCharacterLibrary();
        const listings = library.GetListings();
        expect(listings).toHaveLength(1);
    });

    it("Should create new PersistentCharacters for existing PlayerCharacter statblocks", () => {
        const playerCharacter = StatBlock.Default();
        playerCharacter.Name = "Player Character";
        Store.Save(Store.PlayerCharacters, playerCharacter.Id, playerCharacter);
        const library = new PersistentCharacterLibrary();
        const listings = library.GetListings();
        expect(listings).toHaveLength(1);
        expect(listings[0].Name).toEqual("Player Character");
    });

    it("Should not create duplicate PersistentCharacters for already converted PlayerCharacters", () => {});
});

describe("PersistentCharacter", () => {
    it("SavedCombatants should load their CurrentHP from the Character", () => {});

    it("Should allow the user to save notes", () => {});
    
    it("Should update the Character when a linked Combatant's hp changes", () => {});
    
    it("Should update the statblock when it is edited from the library", () => {});
    
    it("Should update the statblock when it is edited from the combatant", () => {});
    
    it("Should render combatant notes with markdown", () => {});
});
