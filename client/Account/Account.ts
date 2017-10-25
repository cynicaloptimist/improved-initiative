module ImprovedInitiative {
    export interface Account {
        settings: Settings;
        statblocks: ServerListing[];
        playercharacters: ServerListing[];
        spells: ServerListing[];
        encounters: ServerListing[];
    }
}