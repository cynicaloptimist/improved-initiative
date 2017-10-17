module ImprovedInitiative {
    export interface Account {
        settings: Settings;
        statblocks: Listing<StatBlock>[];
        playercharacters: Listing<StatBlock>[];
    }
}