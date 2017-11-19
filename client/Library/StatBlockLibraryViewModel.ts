import { Listing, DedupeByRankAndFilterListings } from "./Listing";
import { StatBlock } from "../StatBlock/StatBlock";
import { EncounterCommander } from "../Commands/EncounterCommander";
import { KeyValueSet } from "../Utility/Toolbox";

export interface StatBlockLibrary {
    StatBlocks: KnockoutObservableArray<Listing<StatBlock>>
    ContainsPlayerCharacters: boolean;
}

export class StatBlockLibraryViewModel {
    private previewStatBlock: KnockoutObservable<StatBlock> = ko.observable(null);
    constructor(
        private encounterCommander: EncounterCommander,
        private library: StatBlockLibrary
    ) {
        this.LibraryFilter.subscribe(n => {
            if (n === "") {
                this.clearCache();
            }
        });
        this.library.StatBlocks.subscribe(this.clearCache);
    }

    LibraryFilter = ko.observable("");

    private filterCache: KeyValueSet<Listing<StatBlock>[]> = {};
    private clearCache = () => this.filterCache = {};

    FilteredStatBlocks = ko.pureComputed<Listing<StatBlock>[]>(() => {
        const filter = (ko.unwrap(this.LibraryFilter) || '').toLocaleLowerCase(),
            statblocks = this.library.StatBlocks();

        if (this.filterCache[filter]) {
            return this.filterCache[filter];
        }

        const parentSubset = this.filterCache[filter.substr(0, filter.length - 1)] || statblocks;

        const finalList = DedupeByRankAndFilterListings(parentSubset, filter);

        this.filterCache[filter] = finalList;

        return finalList;
    });

    ClickEntry = (entry: Listing<StatBlock>, event: JQuery.Event) => this.encounterCommander.AddStatBlockFromListing(entry, event);
    ClickEdit = (entry: Listing<StatBlock>) => this.encounterCommander.EditStatBlock(entry);
    ClickHide = () => this.encounterCommander.HideLibraries();
    ClickAdd = () => this.encounterCommander.CreateAndEditStatBlock(this.library.ContainsPlayerCharacters);

    GetPreviewStatBlock = ko.pureComputed(() => {
        return this.previewStatBlock() || StatBlock.Default();
    })

    PreviewStatBlock = (listing: Listing<StatBlock>) => {
        this.previewStatBlock(null);
        listing.GetAsync(statBlock => {
            this.previewStatBlock(statBlock);
        });
    }
}
