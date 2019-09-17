import * as ko from "knockout";
import { find } from "lodash";
import { now } from "moment";

import moment = require("moment");
import { StoredListing } from "../../common/Listable";
import { PersistentCharacter } from "../../common/PersistentCharacter";
import { StatBlock } from "../../common/StatBlock";
import { AccountClient } from "../Account/AccountClient";
import { LegacySynchronousLocalStore } from "../Utility/LegacySynchronousLocalStore";
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
    const listings = LegacySynchronousLocalStore.List(
      LegacySynchronousLocalStore.PersistentCharacters
    ).map(this.loadPersistentCharacterListing);

    if (listings.length > 0) {
      this.persistentCharacters.push(...listings);
    } else {
      const convertedPlayerCharacterListings = LegacySynchronousLocalStore.List(
        LegacySynchronousLocalStore.PlayerCharacters
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
    let listing = find(
      this.persistentCharacters(),
      c => c.Listing().Id == persistentCharacterId
    );

    if (!listing) {
      listing = new Listing(
        {
          Id: persistentCharacterId,
          Link: `/my/persistentcharacters/${persistentCharacterId}`,
          Metadata: {},
          Name: "",
          Path: "",
          SearchHint: "",
          LastUpdateMs: 0
        },
        "account"
      );
    }
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
    LegacySynchronousLocalStore.Save(
      LegacySynchronousLocalStore.PersistentCharacters,
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

    LegacySynchronousLocalStore.Save<PersistentCharacter>(
      LegacySynchronousLocalStore.PersistentCharacters,
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
    LegacySynchronousLocalStore.Delete(
      LegacySynchronousLocalStore.PersistentCharacters,
      persistentCharacterId
    );
    this.accountClient.DeletePersistentCharacter(persistentCharacterId);
  }

  private loadPersistentCharacterListing = id => {
    const persistentCharacter = {
      ...PersistentCharacter.Default(),
      ...LegacySynchronousLocalStore.Load<PersistentCharacter>(
        LegacySynchronousLocalStore.PersistentCharacters,
        id
      )
    };

    RepairPersistentCharacterIdIfNeeded(persistentCharacter, id);

    return new Listing<PersistentCharacter>(
      {
        ...persistentCharacter,
        SearchHint: PersistentCharacter.GetSearchHint(persistentCharacter),
        Metadata: PersistentCharacter.GetMetadata(persistentCharacter),
        Link: LegacySynchronousLocalStore.PersistentCharacters
      },
      "localStorage"
    );
  };

  private convertPlayerCharacterListing = id => {
    const statBlock = {
      ...StatBlock.Default(),
      ...LegacySynchronousLocalStore.Load<StatBlock>(
        LegacySynchronousLocalStore.PlayerCharacters,
        id
      )
    };
    const persistentCharacter = PersistentCharacter.Initialize(statBlock);
    LegacySynchronousLocalStore.Save<PersistentCharacter>(
      LegacySynchronousLocalStore.PersistentCharacters,
      id,
      persistentCharacter
    );
    return new Listing<PersistentCharacter>(
      {
        ...persistentCharacter,
        SearchHint: PersistentCharacter.GetSearchHint(persistentCharacter),
        Metadata: PersistentCharacter.GetMetadata(persistentCharacter),
        Link: LegacySynchronousLocalStore.PersistentCharacters
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

  LegacySynchronousLocalStore.Save(
    LegacySynchronousLocalStore.PersistentCharacters,
    id,
    persistentCharacter
  );
}
