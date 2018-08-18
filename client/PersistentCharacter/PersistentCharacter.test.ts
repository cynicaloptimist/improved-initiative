import { DefaultPersistentCharacter, InitializeCharacter } from "../../common/PersistentCharacter";
import { StatBlock } from "../../common/StatBlock";
import { PersistentCharacterLibrary } from "../Library/PersistentCharacterLibrary";
import { Store } from "../Utility/Store";

beforeEach(() => {
    localStorage.clear();
});

function savePersistentCharacterWithName(name: string) {
    const persistentCharacter = DefaultPersistentCharacter();
    persistentCharacter.Name = name;
    Store.Save(Store.PersistentCharacters, persistentCharacter.Id, persistentCharacter);
    return persistentCharacter.Id;
}

function savePlayerCharacterWithName(name: string) {
    const playerCharacter = StatBlock.Default();
    playerCharacter.Name = name;
    Store.Save(Store.PlayerCharacters, playerCharacter.Id, playerCharacter);
    return playerCharacter.Id;
}

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
        savePersistentCharacterWithName("Persistent Character");

        const library = new PersistentCharacterLibrary();
        const listings = library.GetListings();
        expect(listings).toHaveLength(1);
        expect(listings[0].Name).toEqual("Persistent Character");
    });

    it("Should create new PersistentCharacters for existing PlayerCharacter statblocks", () => {
        savePlayerCharacterWithName("Player Character");

        const library = new PersistentCharacterLibrary();
        const listings = library.GetListings();
        expect(listings).toHaveLength(1);
        expect(listings[0].Name).toEqual("Player Character");
    });

    it("Should not create duplicate PersistentCharacters for already converted PlayerCharacters", () => {
        savePersistentCharacterWithName("Persistent Character");
        savePlayerCharacterWithName("Player Character");
        
        const library = new PersistentCharacterLibrary();
        const listings = library.GetListings();
        expect(listings).toHaveLength(1);
        expect(listings[0].Name).toEqual("Persistent Character");
    });
});

describe("PersistentCharacter", () => {
    it("SavedCombatants should load their CurrentHP from the Character", () => { });

    it("Should allow the user to save notes", () => { });

    it("Should update the Character when a linked Combatant's hp changes", () => { });

    it("Should update the statblock when it is edited from the library", () => { });

    it("Should update the statblock when it is edited from the combatant", () => { });

    it("Should render combatant notes with markdown", () => { });
});
