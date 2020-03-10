import * as ko from "knockout";

import moment = require("moment");
import { StoredListing } from "../../common/Listable";
import { Spell } from "../../common/Spell";
import { concatenatedStringRegex } from "../../common/Toolbox";
import { AccountClient } from "../Account/AccountClient";
import { Store } from "../Utility/Store";
import { Listing, ListingOrigin } from "./Listing";

export class SpellLibrary {
  private spells = ko.observableArray<Listing<Spell>>([]);
  public GetSpells = ko.pureComputed(() => this.spells());
  public SpellsByNameRegex = ko.pureComputed(() =>
    concatenatedStringRegex(
      this.GetSpells()
        .map(s => s.Listing().Name)
        .filter(n => n.length > 2)
    )
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

  public AddOrUpdateSpell = async (spell: Spell) => {
    spell.LastUpdateMs = moment.now();
    this.spells.remove(listing => listing.Listing().Id === spell.Id);
    spell.Id = AccountClient.MakeId(spell.Id);
    const listing = new Listing<Spell>(
      {
        ...spell,
        SearchHint: Spell.GetSearchHint(spell),
        Metadata: Spell.GetMetadata(spell),
        Link: Store.Spells,
        LastUpdateMs: spell.LastUpdateMs
      },
      "localAsync",
      spell
    );
    this.spells.push(listing);
    await Store.Save(Store.Spells, spell.Id, spell);
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

  public DeleteSpellById = async (id: string) => {
    this.spells.remove(listing => listing.Listing().Id === id);
    await Store.Delete(Store.Spells, id);
    this.accountClient.DeleteSpell(id);
  };
}
