import { ServerListing } from "../../common/Listable";
import { AccountClient } from "../Account/AccountClient";
import { StatBlock } from "../StatBlock/StatBlock";
import { Store } from "../Utility/Store";
import { Listing, ListingOrigin } from "./Listing";

export class PCLibrary {
    public StatBlocks = ko.observableArray<Listing<StatBlock>>([]);
    public ContainsPlayerCharacters = true;

    constructor() {
        const listings = Store.List(Store.PlayerCharacters).map(id => {
            let statBlock = { ...StatBlock.Default(), ...Store.Load<StatBlock>(Store.PlayerCharacters, id) };
            return new Listing<StatBlock>(id, statBlock.Name, statBlock.Path, statBlock.Type, Store.PlayerCharacters, "localStorage");
        });

        ko.utils.arrayPushAll(this.StatBlocks, listings);

        if (this.StatBlocks().length == 0) {
            this.addSamplePlayersFromUrl("/sample_players.json");
        }
    }

    private addSamplePlayersFromUrl = (url: string) => {
        $.getJSON(url, (json: StatBlock[]) => {
            const listings = json.map((statBlock, index) => {
                statBlock = { ...StatBlock.Default(), ...statBlock };
                return new Listing<StatBlock>(index.toString(), statBlock.Name, statBlock.Path, statBlock.Type, null, "server", statBlock);
            });
            ko.utils.arrayPushAll(this.StatBlocks, listings);
        });
    }

    public AddListings = (listings: ServerListing[], source: ListingOrigin) => {
        ko.utils.arrayPushAll<Listing<StatBlock>>(this.StatBlocks, listings.map(c => {
            return new Listing<StatBlock>(c.Id, c.Name, c.Path, c.SearchHint, c.Link, source);
        }));
    }

    public DeleteListing = (id: string) => {
        this.StatBlocks.remove(s => s.Id == id);
        Store.Delete(Store.PlayerCharacters, id);
        new AccountClient().DeletePlayerCharacter(id);
    }
}
