import { AccountClient } from "../Account/AccountClient";
import { StatBlock } from "../StatBlock/StatBlock";
import { Store } from "../Utility/Store";
import { Listing, ListingOrigin, ServerListing } from "./Listing";

export class PCLibrary {
    public StatBlocks = ko.observableArray<Listing<StatBlock>>([]);
    public ContainsPlayerCharacters = true;

    constructor() {
        Store.List(Store.PlayerCharacters).forEach(id => {
            let statBlock = { ...StatBlock.Default(), ...Store.Load<StatBlock>(Store.PlayerCharacters, id) };
            this.StatBlocks.push(new Listing<StatBlock>(id, statBlock.Name, statBlock.Type, Store.PlayerCharacters, "localStorage"));
        });

        if (this.StatBlocks().length == 0) {
            this.addSamplePlayersFromUrl("/sample_players.json");
        }
    }

    private addSamplePlayersFromUrl = (url: string) => {
        $.getJSON(url, (json: StatBlock[]) => {
            json.forEach((statBlock, index) => {
                statBlock = { ...StatBlock.Default(), ...statBlock };
                this.StatBlocks.push(new Listing<StatBlock>(index.toString(), statBlock.Name, statBlock.Type, null, "server", statBlock));
            });
        });
    }

    public AddListings = (listings: ServerListing[], source: ListingOrigin) => {
        ko.utils.arrayPushAll<Listing<StatBlock>>(this.StatBlocks, listings.map(c => {
            return new Listing<StatBlock>(c.Id, c.Name, c.SearchHint, c.Link, source);
        }));
    }

    public DeleteListing = (id: string) => {
        this.StatBlocks.remove(s => s.Id == id);
        new AccountClient().DeletePlayerCharacter(id);
    }
}
