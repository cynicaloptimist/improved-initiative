module ImprovedInitiative {
    export class LibrariesViewModel {
        constructor(
            public EncounterCommander: EncounterCommander,
            public Libraries: Libraries
        ) { }

        LibraryTabs = [
            {
                Name: "Creatures",
                Component: "npclibrary",
                Library: this.Libraries.NPCs
            },
            {
                Name: "Encounters",
                Component: "encounterlibrary",
                Library: this.Libraries.Encounters
            }
        ];

        SelectedTab = ko.observable(this.LibraryTabs[0]);

        TabClassName = library => library === this.SelectedTab() ? 'selected' : '';
    }
}