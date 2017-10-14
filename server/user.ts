import { StatBlock, Listing } from "./library";

export interface User {
    settings: any;
    statblocks: { [id: string]: StatBlock };
    playercharacters: { [id: string]: StatBlock };
    spells: { [id: string]: any };
    encounters: { [id: string]: any };
}