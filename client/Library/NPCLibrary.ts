import { Listing, ServerListing, ListingOrigin } from "./Listing";
import { StatBlock } from "../StatBlock/StatBlock";
import { Store } from "../Utility/Store";
import { AccountClient } from "../Account/AccountClient";

export class NPCLibrary {
    public StatBlocks = ko.observableArray<Listing<StatBlock>>([]);
    public ContainsPlayerCharacters = false;

    constructor() {
        $.ajax("../statblocks/").done(s => this.AddStatBlockListings(s, "server"));

        const localStatBlocks = Store.List(Store.StatBlocks);
        localStatBlocks.forEach(id => {
            let statBlock = { ...StatBlock.Default(), ...Store.Load<StatBlock>(Store.StatBlocks, id) };
            this.StatBlocks.push(new Listing<StatBlock>(id, statBlock.Name, statBlock.Type, Store.StatBlocks, "localStorage"));
        });
    }

    public AddStatBlockListings = (listings: ServerListing[], source: ListingOrigin) => {
        ko.utils.arrayPushAll<Listing<StatBlock>>(this.StatBlocks, listings.map(c => {
            return new Listing<StatBlock>(c.Id, c.Name, c.SearchHint, c.Link, source);
        }));
    }

    public DeleteListing = (id: string) => {
        this.StatBlocks.remove(s => s.Id == id);
        new AccountClient().DeleteStatBlock(id);
    }
}
