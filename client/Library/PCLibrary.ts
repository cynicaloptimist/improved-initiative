import { ServerListing } from "../../common/Listable";
import { AccountClient } from "../Account/AccountClient";
import { StatBlock } from "../StatBlock/StatBlock";
import { Store } from "../Utility/Store";
import { Listing, ListingOrigin } from "./Listing";

export class PCLibrary {
    public StatBlocks = ko.observableArray<Listing<StatBlock>>([]);
    public readonly StoreName = Store.PlayerCharacters;
    
    constructor() {
        const listings = Store.List(this.StoreName).map(id => {
            let statBlock = { ...StatBlock.Default(), ...Store.Load<StatBlock>(this.StoreName, id) };
            return new Listing<StatBlock>(id, statBlock.Name, statBlock.Path, statBlock.Type, this.StoreName, "localStorage");
        });

        ko.utils.arrayPushAll(this.StatBlocks, listings);

        this.addSamplePlayersFromUrl("/sample_players.json");
    }

    private addSamplePlayersFromUrl = (url: string) => {
        $.getJSON(url, (json: StatBlock[]) => {
            const listings = json.map((statBlock, index) => {
                statBlock = { ...StatBlock.Default(), ...statBlock };
                return new Listing<StatBlock>(index.toString(), statBlock.Name, "Sample Player Characters", statBlock.Type, null, "server", statBlock);
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
        Store.Delete(this.StoreName, id);
        new AccountClient().DeletePlayerCharacter(id);
    }

    public SaveEditedStatBlock = (listing: Listing<StatBlock>, newStatBlock: StatBlock) => {
        const statBlockId = listing.Id;
        Store.Save<StatBlock>(this.StoreName, statBlockId, newStatBlock);
        listing.SetValue(newStatBlock);

        new AccountClient().SavePlayerCharacter(newStatBlock)
            .then(r => {
                if (!r || listing.Origin === "account") {
                    return;
                }
                const accountListing = new Listing<StatBlock>(statBlockId, newStatBlock.Name, newStatBlock.Path, newStatBlock.Type, `/my/playercharacters/${statBlockId}`, "account", newStatBlock);
                this.StatBlocks.push(accountListing);
            });
    }
}
