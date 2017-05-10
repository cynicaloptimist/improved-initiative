module ImprovedInitiative {
    export class LibrariesViewModel {
        constructor(
            public EncounterCommander: EncounterCommander,
            public Libraries: Libraries
        ) { }

        LibraryTabs = [
            {
                Name: "Creatures",
                Component: "statblocklibrary",
                Library: this.Libraries.NPCs
            },
            {
                Name: "Players",
                Component: "statblocklibrary",
                Library: this.Libraries.PCs
            },
            {
                Name: "Encounters",
                Component: "encounterlibrary",
                Library: this.Libraries.Encounters
            },
            {
                Name: "Spells",
                Component: "spelllibrary",
                Library: this.Libraries.Spells
            }
        ];

        SelectedTab = ko.observable(this.LibraryTabs[0]);

        TabClassName = library => library === this.SelectedTab() ? 'selected' : '';
    }
}