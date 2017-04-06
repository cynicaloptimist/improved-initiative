module ImprovedInitiative {
    export class StatBlockLibrary {
        constructor() {
            $.ajax("../statblocks/").done(this.AddStatBlockListings);
            
            Store.List(Store.SavedEncounters).forEach(e => this.SavedEncounterIndex.push(e));
            
            Store.List(Store.StatBlocks).forEach(id => {
                var statBlock = { ...StatBlock.Default(), ...Store.Load<StatBlock>(Store.StatBlocks, id) };
                this.NPCStatBlocks.push(new StatBlockListing(id, statBlock.Name, statBlock.Type, null, "localStorage", statBlock));
            });

            Store.List(Store.PlayerCharacters).forEach(id => {
                var statBlock = { ...StatBlock.Default(), ...Store.Load<StatBlock>(Store.PlayerCharacters, id) };
                this.PCStatBlocks.push(new StatBlockListing(id, statBlock.Name, statBlock.Type, null, "localStorage", statBlock));
            });

            if (this.PCStatBlocks().length == 0) {
                this.AddSamplePlayersFromUrl('/sample_players.json');
            }

            
            const appInsights = window["appInsights"];
            appInsights.trackEvent("SavedEncounters", { Count: this.SavedEncounterIndex().length });
            appInsights.trackEvent("CustomPlayerCharacters", { Count: this.PCStatBlocks().length });
            appInsights.trackEvent("CustomCreatures", { Count: this.NPCStatBlocks().length});
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
            $.getJSON(url, (json: StatBlock []) => {
                json.forEach((statBlock, index) => {
                    statBlock = { ...StatBlock.Default(), ...statBlock }
                    this.PCStatBlocks.push(new StatBlockListing(index.toString(), statBlock.Name, statBlock.Type, null, "localStorage", statBlock));
                })
            });
        } 
    }
}