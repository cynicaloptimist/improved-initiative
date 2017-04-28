module ImprovedInitiative {
    export class LibrariesViewModel {
        constructor(
            public EncounterCommander: EncounterCommander,
            private npcLibrary: NPCLibrary,
            private encounterLibrary: EncounterLibrary,
        ) { }

        Libraries = [
            {
                Name: "Creatures",
                Component: "npclibrary",
                Library: this.npcLibrary
            },
            {
                Name: "Encounters",
                Component: "encounterlibrary",
                Library: this.encounterLibrary
            }
        ];

        SelectedTab = ko.observable(this.Libraries[0]);

        TabClassName = library => library === this.SelectedTab() ? 'selected' : '';
    }
}