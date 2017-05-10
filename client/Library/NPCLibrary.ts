module ImprovedInitiative {
    export class NPCLibrary {
        StatBlocks = ko.observableArray<StatBlockListing>([]);

        constructor() {
            $.ajax("../statblocks/").done(this.AddStatBlockListings);

            const customCreatures = Store.List(Store.StatBlocks);
            customCreatures.forEach(id => {
                var statBlock = { ...StatBlock.Default(), ...Store.Load<StatBlock>(Store.StatBlocks, id) };
                this.StatBlocks.push(new StatBlockListing(id, statBlock.Name, statBlock.Type, null, "localStorage", statBlock));
            });

            const appInsights: Client = window["appInsights"];
            appInsights.trackEvent("CustomCreatures", { Count: customCreatures.length.toString() });
        }

        AddStatBlockListings = (listings: { Id: string, Name: string, Keywords: string, Link: string }[]) => {
            listings.sort((c1, c2) => {
                return c1.Name.toLocaleLowerCase() > c2.Name.toLocaleLowerCase() ? 1 : -1;
            });
            ko.utils.arrayPushAll<StatBlockListing>(this.StatBlocks, listings.map(c => {
                return new StatBlockListing(c.Id, c.Name, c.Keywords, c.Link, "server");
            }));
        }
    }
}