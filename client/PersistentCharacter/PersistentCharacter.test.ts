import { DefaultPersistentCharacter, InitializeCharacter } from "../../common/PersistentCharacter";
import { StatBlock } from "../../common/StatBlock";
import { PersistentCharacterLibrary } from "../Library/PersistentCharacterLibrary";
import { Store } from "../Utility/Store";
import { buildEncounter } from "../test/buildEncounter";

describe("InitializeCharacter", () => {
    it("Should have the current HP of the provided statblock", () => {
        const statBlock = StatBlock.Default();
        statBlock.HP.Value = 10;
        const character = InitializeCharacter(statBlock);
        expect(character.CurrentHP).toBe(10);
    });
});

describe("PersistentCharacterLibrary", () => {
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
    it("Should persist CurrentHP across encounters", async done => {
        const persistentCharacter = DefaultPersistentCharacter();
        persistentCharacter.Name = "Persistent Character";
        persistentCharacter.StatBlock.HP.Value = 10;
        Store.Save(Store.PersistentCharacters, persistentCharacter.Id, persistentCharacter);

        const encounter1 = buildEncounter();
        const combatant1 = await encounter1.AddCombatantFromPersistentCharacter(persistentCharacter.Id);
        combatant1.ApplyDamage(5);

        const encounter2 = buildEncounter();
        const combatant2 = await encounter2.AddCombatantFromPersistentCharacter(persistentCharacter.Id);
        expect(combatant2.CurrentHP()).toEqual(5);

        done();
    });

    it("Should not save PersistentCharacters with Encounters", () => { });

    it("Should not allow the same Persistent Character to be added twice");

    it("Should allow the user to save notes", () => { });

    it("Should update the Character when a linked Combatant's hp changes", () => { });

    it("Should update the statblock when it is edited from the library", () => { });

    it("Should update the statblock when it is edited from the combatant", () => { });

    it("Should render combatant notes with markdown", () => { });
});
