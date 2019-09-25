import * as ko from "knockout";

import moment = require("moment");
import { StoredListing } from "../../common/Listable";
import { Spell } from "../../common/Spell";
import { concatenatedStringRegex } from "../../common/Toolbox";
import { AccountClient } from "../Account/AccountClient";
import { LegacySynchronousLocalStore } from "../Utility/LegacySynchronousLocalStore";
import { Listing, ListingOrigin } from "./Listing";

export class SpellLibrary {
  private spells = ko.observableArray<Listing<Spell>>([]);
  public GetSpells = ko.pureComputed(() => this.spells());
  public SpellsByNameRegex = ko.pureComputed(() =>
    concatenatedStringRegex(this.GetSpells().map(s => s.Listing().Name))
  );

  constructor(private accountClient: AccountClient) {}

  public AddListings = (listings: StoredListing[], source: ListingOrigin) => {
    ko.utils.arrayPushAll<Listing<Spell>>(
      this.spells,
      listings.map(c => {
        return new Listing<Spell>(c, source);
      })
    );
  };

  public AddOrUpdateSpell = (spell: Spell) => {
    spell.LastUpdateMs = moment.now();
    this.spells.remove(listing => listing.Listing().Id === spell.Id);
    spell.Id = AccountClient.MakeId(spell.Id);
    const listing = new Listing<Spell>(
      {
        ...spell,
        SearchHint: Spell.GetSearchHint(spell),
        Metadata: Spell.GetMetadata(spell),
        Link: LegacySynchronousLocalStore.Spells,
        LastUpdateMs: spell.LastUpdateMs
      },
      "localStorage",
      spell
    );
    this.spells.push(listing);
    LegacySynchronousLocalStore.Save(
      LegacySynchronousLocalStore.Spells,
      spell.Id,
      spell
    );
    this.accountClient.SaveSpell(spell).then(r => {
      if (!r) return;
      if (listing.Origin === "account") return;
      const accountListing = new Listing<Spell>(
        {
          Id: spell.Id,
          Name: spell.Name,
          Path: spell.Path,
          SearchHint: Spell.GetSearchHint(spell),
          Metadata: Spell.GetMetadata(spell),
          Link: `/my/spells/${spell.Id}`,
          LastUpdateMs: moment.now()
        },
        "account",
        spell
      );
      this.spells.push(accountListing);
    });
  };

  public DeleteSpellById = (id: string) => {
    this.spells.remove(listing => listing.Listing().Id === id);
    LegacySynchronousLocalStore.Delete(LegacySynchronousLocalStore.Spells, id);
    this.accountClient.DeleteSpell(id);
  };
}
