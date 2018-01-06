import { Libraries } from "../Library/Libraries";
import { env } from "../Environment";
import { Store } from "../Utility/Store";
import { AccountClient } from "../Account/AccountClient";
import { Listable, Listing } from "../Library/Listing";

function getCounts<T extends Listable>(items: Listing<T>[]) {
    const localCount = items.filter(c => c.Origin === "localStorage").length;
    const accountCount = items.filter(c => c.Origin === "account").length;
    return `${localCount} local, ${accountCount} synced`;
}

export class AccountViewModel {
    constructor(private libraries: Libraries) { }

    public IsLoggedIn = env.IsLoggedIn;
    public HasStorage = env.HasStorage;
    public PatreonLoginUrl = env.PatreonLoginUrl;

    public SyncedCreatures = ko.computed(() => getCounts(this.libraries.NPCs.StatBlocks()));
    public SyncedPlayers = ko.computed(() => getCounts(this.libraries.PCs.StatBlocks()));
    public SyncedSpells = ko.computed(() => getCounts(this.libraries.Spells.Spells()));
    public SyncedEncounters = ko.computed(() => getCounts(this.libraries.Encounters.Encounters()));

    public SyncAll() {
        this.SyncMessage("");
        let blob = Store.ExportAll();
        saveAs(blob, "improved-initiative.json");
        new AccountClient().SaveAll(this.libraries, err => {
            this.SyncMessage(this.SyncMessage() + "\n" + JSON.stringify(err));
        });
    };

    public SyncMessage = ko.observable("");
}
