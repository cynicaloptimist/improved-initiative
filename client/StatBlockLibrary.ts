module ImprovedInitiative {
    export class StatBlockLibrary {
        constructor() {
            Store.List(Store.SavedEncounters).forEach(e => this.SavedEncounterIndex.push(e));
            
            Store.List(Store.PlayerCharacters).forEach(id => {
                var statBlock = $.extend(StatBlock.Empty(), Store.Load<IStatBlock>(Store.PlayerCharacters, id));
                this.PCStatBlocks.push(new StatBlockListing(id, statBlock.Name, statBlock.Type, null, "localStorage", statBlock));
            });

            if (this.PCStatBlocks().length == 0) {
                this.AddSamplePlayersFromUrl('/sample_players.json');
            }

            Store.List(Store.StatBlocks).forEach(id => {
                var statBlock = $.extend(StatBlock.Empty(), Store.Load<IStatBlock>(Store.StatBlocks, id));
                this.NPCStatBlocks.push(new StatBlockListing(id, statBlock.Name, statBlock.Type, null, "localStorage", statBlock));
            })
        }

        NPCStatBlocks = ko.observableArray<StatBlockListing>([]);
        PCStatBlocks = ko.observableArray<StatBlockListing>([]);
        SavedEncounterIndex = ko.observableArray<string>([]);
        
        AddStatBlockListings = (listings: { Id: string, Name: string, Type: string, Link: string } []) => {
            listings.sort((c1, c2) => {
                return c1.Name.toLocaleLowerCase() > c2.Name.toLocaleLowerCase() ? 1 : -1;
            });
            ko.utils.arrayPushAll<StatBlockListing>(this.NPCStatBlocks, listings.map(c => {
                return new StatBlockListing(c.Id, c.Name, c.Type, c.Link, "server");
            }));
        }

        AddSamplePlayersFromUrl = (url: string) => {
            $.getJSON(url, (json: IStatBlock []) => {
                json.forEach((statBlock, index) => {
                    statBlock = $.extend(StatBlock.Empty(), statBlock);
                    this.PCStatBlocks.push(new StatBlockListing(index.toString(), statBlock.Name, statBlock.Type, null, "localStorage", statBlock));
                })
            });
        } 
    }
}