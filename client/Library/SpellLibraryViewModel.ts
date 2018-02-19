import { EncounterCommander } from "../Commands/EncounterCommander";
import { Spell } from "../Spell/Spell";
import { KeyValueSet } from "../Utility/Toolbox";
import { DedupeByRankAndFilterListings } from "./FilterCache";
import { Listing } from "./Listing";
import { SpellLibrary } from "./SpellLibrary";

export class SpellLibraryViewModel {
    constructor(
        private encounterCommander: EncounterCommander,
        private library: SpellLibrary
    ) {
        this.LibraryFilter.subscribe(n => {
            if (n === "") {
                this.clearCache();
            }
        });
        this.library.Spells.subscribe(this.clearCache);
    }

    public LibraryFilter = ko.observable("");

    private filterCache: KeyValueSet<Listing<Spell>[]> = {};
    private clearCache = () => this.filterCache = {};

    public FilteredSpells = ko.pureComputed<Listing<Spell>[]>(() => {
        const filter = (ko.unwrap(this.LibraryFilter) || "").toLocaleLowerCase(),
            spells = this.library.Spells();

        if (this.filterCache[filter]) {
            return this.filterCache[filter];
        }

        const parentSubset = this.filterCache[filter.substr(0, filter.length - 1)] || spells;

        const finalList = DedupeByRankAndFilterListings(parentSubset, filter);

        this.filterCache[filter] = finalList;

        return finalList;
    });

    public ClickEntry = (entry: Listing<Spell>) => this.encounterCommander.ReferenceSpell(entry);
    public ClickEdit = (entry: Listing<Spell>) => this.encounterCommander.EditSpell(entry);
    public ClickHide = () => this.encounterCommander.HideLibraries();
    public ClickAdd = () => this.encounterCommander.CreateAndEditSpell();
}
