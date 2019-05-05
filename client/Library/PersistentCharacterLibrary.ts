import * as ko from "knockout";
import { find } from "lodash";
import { now } from "moment";

import { StoredListing } from "../../common/Listable";
import { PersistentCharacter } from "../../common/PersistentCharacter";
import { StatBlock } from "../../common/StatBlock";
import { AccountClient } from "../Account/AccountClient";
import { Store } from "../Utility/Store";
import { Listing, ListingOrigin } from "./Listing";

export interface PersistentCharacterUpdater {
  UpdatePersistentCharacter: (
    persistentCharacterId: string,
    updates: Partial<PersistentCharacter>
  ) => Promise<void>;
}

export class PersistentCharacterLibrary implements PersistentCharacterUpdater {
  private persistentCharacters: KnockoutObservableArray<
    Listing<PersistentCharacter>
  > = ko.observableArray([]);

  constructor(private accountClient: AccountClient) {
    const listings = Store.List(Store.PersistentCharacters).map(
      this.loadPersistentCharacterListing
    );

    if (listings.length > 0) {
      this.persistentCharacters.push(...listings);
    } else {
      const convertedPlayerCharacterListings = Store.List(
        Store.PlayerCharacters
      ).map(this.convertPlayerCharacterListing);
      this.persistentCharacters.push(...convertedPlayerCharacterListings);
    }
  }

  public GetListings = ko.pureComputed(() => this.persistentCharacters());

  public AddListings = (listings: StoredListing[], source: ListingOrigin) => {
    const newListings = listings.map(c => {
      return new Listing<PersistentCharacter>(c, source);
    });
    this.persistentCharacters.push(...newListings);
  };

  public async GetPersistentCharacter(persistentCharacterId: string) {
    const listing = find(
      this.persistentCharacters(),
      c => c.Listing().Id == persistentCharacterId
    );
    return await listing.GetWithTemplate(PersistentCharacter.Default());
  }

  public AddNewPersistentCharacter(persistentCharacter: PersistentCharacter) {
    const listing = new Listing<PersistentCharacter>(
      {
        ...persistentCharacter,
        SearchHint: PersistentCharacter.GetSearchHint(persistentCharacter),
        Metadata: PersistentCharacter.GetMetadata(persistentCharacter),
        Link: persistentCharacter.Id
      },
      "localStorage",
      persistentCharacter
    );
    this.persistentCharacters.push(listing);
    Store.Save(
      Store.PersistentCharacters,
      persistentCharacter.Id,
      persistentCharacter
    );
    this.accountClient.SavePersistentCharacter(persistentCharacter);
    return listing;
  }

  public async UpdatePersistentCharacter(
    persistentCharacterId: string,
    updates: Partial<PersistentCharacter>
  ) {
    if (updates.StatBlock) {
      updates.Name = updates.StatBlock.Name;
      updates.Path = updates.StatBlock.Path;
      updates.Version = updates.StatBlock.Version;
    }
    const currentCharacterListing = find(
      this.persistentCharacters(),
      p => p.Listing().Id == persistentCharacterId
    );
    const currentCharacter = await currentCharacterListing.GetWithTemplate(
      PersistentCharacter.Default()
    );
    const updatedCharacter = {
      ...currentCharacter,
      ...updates,
      LastUpdateMs: now()
    };

    this.persistentCharacters.remove(currentCharacterListing);
    currentCharacterListing.SetValue(updatedCharacter);
    this.persistentCharacters.push(currentCharacterListing);

    Store.Save<PersistentCharacter>(
      Store.PersistentCharacters,
      persistentCharacterId,
      updatedCharacter
    );
    this.accountClient.SavePersistentCharacter(updatedCharacter);
    return;
  }

  public async DeletePersistentCharacter(persistentCharacterId: string) {
    this.persistentCharacters.remove(
      p => p.Listing().Id == persistentCharacterId
    );
    Store.Delete(Store.PersistentCharacters, persistentCharacterId);
    this.accountClient.DeletePersistentCharacter(persistentCharacterId);
  }

  private loadPersistentCharacterListing = id => {
    const persistentCharacter = {
      ...PersistentCharacter.Default(),
      ...Store.Load<PersistentCharacter>(Store.PersistentCharacters, id)
    };

    RepairPersistentCharacterIdIfNeeded(persistentCharacter, id);

    return new Listing<PersistentCharacter>(
      {
        ...persistentCharacter,
        SearchHint: PersistentCharacter.GetSearchHint(persistentCharacter),
        Metadata: PersistentCharacter.GetMetadata(persistentCharacter),
        Link: Store.PersistentCharacters
      },
      "localStorage"
    );
  };

  private convertPlayerCharacterListing = id => {
    const statBlock = {
      ...StatBlock.Default(),
      ...Store.Load<StatBlock>(Store.PlayerCharacters, id)
    };
    const persistentCharacter = PersistentCharacter.Initialize(statBlock);
    Store.Save<PersistentCharacter>(
      Store.PersistentCharacters,
      id,
      persistentCharacter
    );
    return new Listing<PersistentCharacter>(
      {
        ...persistentCharacter,
        SearchHint: PersistentCharacter.GetSearchHint(persistentCharacter),
        Metadata: PersistentCharacter.GetMetadata(persistentCharacter),
        Link: Store.PersistentCharacters
      },
      "localStorage"
    );
  };
}

function RepairPersistentCharacterIdIfNeeded(
  persistentCharacter: PersistentCharacter,
  id: string
) {
  if (
    persistentCharacter.Id != null &&
    persistentCharacter.StatBlock.Id == persistentCharacter.Id
  ) {
    return;
  }

  persistentCharacter.Id = id;
  persistentCharacter.StatBlock.Id = id;

  Store.Save(Store.PersistentCharacters, id, persistentCharacter);
}
