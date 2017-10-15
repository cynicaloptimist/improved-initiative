module ImprovedInitiative {
    export class PCLibrary {
        StatBlocks = ko.observableArray<StatBlockListing>([]);
        ContainsPlayerCharacters = true;

        constructor() {
            Store.List(Store.PlayerCharacters).forEach(id => {
                var statBlock = { ...StatBlock.Default(), ...Store.Load<StatBlock>(Store.PlayerCharacters, id) };
                this.StatBlocks.push(new StatBlockListing(id, statBlock.Name, statBlock.Type, null, "localStorage", statBlock));
            });

            Metrics.TrackEvent("CustomPlayerCharacters", { Count: this.StatBlocks().length.toString() });

            if (this.StatBlocks().length == 0) {
                this.addSamplePlayersFromUrl('/sample_players.json');
            }
        }

        private addSamplePlayersFromUrl = (url: string) => {
            $.getJSON(url, (json: StatBlock[]) => {
                json.forEach((statBlock, index) => {
                    statBlock = { ...StatBlock.Default(), ...statBlock }
                    this.StatBlocks.push(new StatBlockListing(index.toString(), statBlock.Name, statBlock.Type, null, "localStorage", statBlock));
                })
            });
        }

        AddStatBlockListings = (listings: StatBlockListingStatic[], source: EntitySource) => {
            listings.sort((c1, c2) => {
                return c1.Name.toLocaleLowerCase() > c2.Name.toLocaleLowerCase() ? 1 : -1;
            });
            ko.utils.arrayPushAll<StatBlockListing>(this.StatBlocks, listings.map(c => {
                return new StatBlockListing(c.Id, c.Name, c.Keywords, c.Link, source);
            }));
        }
    }
}