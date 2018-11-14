import { find } from "lodash";
import { now } from "moment";
import { ServerListing } from "../../common/Listable";
import { DefaultPersistentCharacter, InitializeCharacter, PersistentCharacter } from "../../common/PersistentCharacter";
import { StatBlock } from "../../common/StatBlock";
import { Store } from "../Utility/Store";
import { Listing, ListingOrigin } from "./Listing";

export class PersistentCharacterLibrary {
    constructor() {
        const listings = Store.List(Store.PersistentCharacters).map(this.loadPersistentCharacterListing);

        if (listings.length > 0) {
            this.persistentCharacters.push(...listings);
        } else {
            const convertedPlayerCharacterListings = Store.List(Store.PlayerCharacters).map(this.convertPlayerCharacterListing);
            this.persistentCharacters.push(...convertedPlayerCharacterListings);
        }
    }

    private loadPersistentCharacterListing = id => {
        const persistentCharacter = { ...DefaultPersistentCharacter(), ...Store.Load<PersistentCharacter>(Store.PersistentCharacters, id) };
        return new Listing<PersistentCharacter>(id, persistentCharacter.Name, persistentCharacter.Path, persistentCharacter.StatBlock.Type, Store.PersistentCharacters, "localStorage");
    }

    private convertPlayerCharacterListing = id => {
        const statBlock = { ...StatBlock.Default(), ...Store.Load<StatBlock>(Store.PlayerCharacters, id) };
        const persistentCharacter = InitializeCharacter(statBlock);
        Store.Save<PersistentCharacter>(Store.PersistentCharacters, id, persistentCharacter);
        return new Listing<PersistentCharacter>(id, persistentCharacter.Name, persistentCharacter.Path, persistentCharacter.StatBlock.Type, Store.PersistentCharacters, "localStorage");
    }

    public GetListings = () => this.persistentCharacters;

    public AddListings = (listings: ServerListing[], source: ListingOrigin) => {
        const newListings = listings.map(c => {
            return new Listing<PersistentCharacter>(c.Id, c.Name, c.Path, c.SearchHint, c.Link, source);
        });
        this.persistentCharacters.push(...newListings);
    }

    public async UpdatePersistentCharacter(persistentCharacterId: string, updates: Partial<PersistentCharacter>) {
        const currentCharacterListing = find(this.persistentCharacters, p => p.Id == persistentCharacterId);
        const currentCharacter = await currentCharacterListing.GetWithTemplate(DefaultPersistentCharacter());
        const updatedCharacter = {
            ...currentCharacter,
            ...updates,
            LastUpdateMs: now()
        };

        currentCharacterListing.SetValue(updatedCharacter);
        Store.Save<PersistentCharacter>(Store.PersistentCharacters, persistentCharacterId, updatedCharacter);
        return;
    }

    private persistentCharacters: Listing<PersistentCharacter>[] = [];
}