module ImprovedInitiative {
    export class PCLibrary {
        StatBlocks = ko.observableArray<StatBlockListing>([]);
        
        constructor() {
            Store.List(Store.PlayerCharacters).forEach(id => {
                var statBlock = { ...StatBlock.Default(), ...Store.Load<StatBlock>(Store.PlayerCharacters, id) };
                this.StatBlocks.push(new StatBlockListing(id, statBlock.Name, statBlock.Type, null, "localStorage", statBlock));
            });

            if (this.StatBlocks().length == 0) {
                this.AddSamplePlayersFromUrl('/sample_players.json');
            }

            const appInsights: Client = window["appInsights"];
            appInsights.trackEvent("CustomPlayerCharacters", { Count: this.StatBlocks().length.toString() });
        }

        AddSamplePlayersFromUrl = (url: string) => {
            $.getJSON(url, (json: StatBlock []) => {
                json.forEach((statBlock, index) => {
                    statBlock = { ...StatBlock.Default(), ...statBlock }
                    this.StatBlocks.push(new StatBlockListing(index.toString(), statBlock.Name, statBlock.Type, null, "localStorage", statBlock));
                })
            });
        } 
    }
    export class NPCLibrary {
        StatBlocks = ko.observableArray<StatBlockListing>([]);
        
        constructor() {
            $.ajax("../statblocks/").done(this.AddStatBlockListings);
            
            Store.List(Store.StatBlocks).forEach(id => {
                var statBlock = { ...StatBlock.Default(), ...Store.Load<StatBlock>(Store.StatBlocks, id) };
                this.StatBlocks.push(new StatBlockListing(id, statBlock.Name, statBlock.Type, null, "localStorage", statBlock));
            });

            const appInsights: Client = window["appInsights"];
            appInsights.trackEvent("CustomCreatures", { Count: this.StatBlocks().length.toString()});
        }

        AddStatBlockListings = (listings: { Id: string, Name: string, Type: string, Link: string } []) => {
            listings.sort((c1, c2) => {
                return c1.Name.toLocaleLowerCase() > c2.Name.toLocaleLowerCase() ? 1 : -1;
            });
            ko.utils.arrayPushAll<StatBlockListing>(this.StatBlocks, listings.map(c => {
                return new StatBlockListing(c.Id, c.Name, c.Type, c.Link, "server");
            }));
        }
    }

    export class EncounterLibrary {
        SavedEncounterIndex = ko.observableArray<string>([]);

        constructor() {
            Store.List(Store.SavedEncounters).forEach(e => this.SavedEncounterIndex.push(e));

            const appInsights: Client = window["appInsights"];
            appInsights.trackEvent("SavedEncounters", { Count: this.SavedEncounterIndex().length.toString() });
        }
    }
}