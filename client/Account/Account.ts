import { Settings } from "../Settings/Settings";
import { ServerListing } from "../Library/Listing";

export interface Account {
    settings: Settings;
    statblocks: ServerListing[];
    playercharacters: ServerListing[];
    spells: ServerListing[];
    encounters: ServerListing[];
}
