import { StatBlock, Listing } from "./library";

export interface User {
    settings: any;
    creatures: { [id: string]: StatBlock };
    spells: { [id: string]: any };
    encounters: { [id: string]: any };
}