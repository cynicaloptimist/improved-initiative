import { ServerListing } from "../../common/Listable";
import { Settings } from "../Settings/Settings";

export interface Account {
    settings: Settings;
    statblocks: ServerListing[];
    playercharacters: ServerListing[];
    spells: ServerListing[];
    encounters: ServerListing[];
}
