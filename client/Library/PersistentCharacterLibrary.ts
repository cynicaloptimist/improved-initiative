import { DefaultPersistentCharacter, PersistentCharacter } from "../../common/PersistentCharacter";
import { Store } from "../Utility/Store";
import { Listing } from "./Listing";

export class PersistentCharacterLibrary {
    constructor() {
        const listings = Store.List(Store.PersistentCharacters).map(this.loadPersistentCharacterListing);

        this.persistentCharacters.push(...listings);
    }

    private loadPersistentCharacterListing = id => {
        const persistentCharacter = { ...DefaultPersistentCharacter(), ...Store.Load<PersistentCharacter>(Store.PersistentCharacters, id) };
        return new Listing<PersistentCharacter>(id, persistentCharacter.Name, persistentCharacter.Path, persistentCharacter.StatBlock.Type, Store.PersistentCharacters, "localStorage");
    }

    public GetListings = () => this.persistentCharacters;

    private persistentCharacters: Listing<PersistentCharacter> [] = [];
}