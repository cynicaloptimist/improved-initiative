import { ServerListing } from "../../common/Listable";
import { AccountClient } from "../Account/AccountClient";
import { StatBlock } from "../StatBlock/StatBlock";
import { Store } from "../Utility/Store";
import { Listing, ListingOrigin } from "./Listing";

export class NPCLibrary {
    public StatBlocks = ko.observableArray<Listing<StatBlock>>([]);
    public ContainsPlayerCharacters = false;

    constructor() {
        $.ajax("../statblocks/").done(s => this.AddListings(s, "server"));

        const localStatBlocks = Store.List(Store.StatBlocks);
        const listings = localStatBlocks.map(id => {
            let statBlock = { ...StatBlock.Default(), ...Store.Load<StatBlock>(Store.StatBlocks, id) };
            return new Listing<StatBlock>(id, statBlock.Name, statBlock.Path, statBlock.Type, Store.StatBlocks, "localStorage");
        });
        ko.utils.arrayPushAll(this.StatBlocks, listings);
    }

    public AddListings = (listings: ServerListing[], source: ListingOrigin) => {
        ko.utils.arrayPushAll<Listing<StatBlock>>(this.StatBlocks, listings.map(c => {
            return new Listing<StatBlock>(c.Id, c.Name, c.Path, c.SearchHint, c.Link, source);
        }));
    }

    public DeleteListing = (id: string) => {
        this.StatBlocks.remove(s => s.Id == id);
        Store.Delete(Store.StatBlocks, id);
        new AccountClient().DeleteStatBlock(id);
    }

    public SaveEditedStatBlock = (listing: Listing<StatBlock>, newStatBlock: StatBlock) => {
        const statBlockId = listing.Id;
        Store.Save<StatBlock>(Store.StatBlocks, statBlockId, newStatBlock);
        listing.SetValue(newStatBlock);
        new AccountClient().SaveStatBlock(newStatBlock)
            .then(r => {
                if (!r || listing.Origin === "account") {
                    return;
                }
                const accountListing = new Listing<StatBlock>(statBlockId, newStatBlock.Name, newStatBlock.Path, newStatBlock.Type, `/my/statblocks/${statBlockId}`, "account", newStatBlock);
                this.StatBlocks.push(accountListing);
            });

    }
}
