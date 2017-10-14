module ImprovedInitiative {
    export class NPCLibrary {
        StatBlocks = ko.observableArray<StatBlockListing>([]);
        ContainsPlayerCharacters = false;

        constructor() {
            const gotStatBlocks = new AccountClient().GetStatBlocks(myListings => {
                this.AddStatBlockListings(myListings);
                $.ajax("../statblocks/").done(this.AddStatBlockListings);
            });

            if (!gotStatBlocks) {
                const localStatBlocks = Store.List(Store.StatBlocks);
                localStatBlocks.forEach(id => {
                    var statBlock = { ...StatBlock.Default(), ...Store.Load<StatBlock>(Store.StatBlocks, id) };
                    this.StatBlocks.push(new StatBlockListing(id, statBlock.Name, statBlock.Type, null, "localStorage", statBlock));
                });
                Metrics.TrackEvent("LocalStatBlocks", { Count: localStatBlocks.length.toString() });
            }
        }

        AddStatBlockListings = (listings: StatBlockListingStatic[]) => {
            listings.sort((c1, c2) => {
                return c1.Name.toLocaleLowerCase() > c2.Name.toLocaleLowerCase() ? 1 : -1;
            });
            ko.utils.arrayPushAll<StatBlockListing>(this.StatBlocks, listings.map(c => {
                return new StatBlockListing(c.Id, c.Name, c.Keywords, c.Link, "server");
            }));
        }
    }
}