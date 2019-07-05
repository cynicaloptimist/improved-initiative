import { StoredListing } from "../../common/Listable";
import { Settings } from "../../common/Settings";

export interface Account {
  settings: Settings;
  statblocks: StoredListing[];
  playercharacters: StoredListing[];
  persistentcharacters: StoredListing[];
  spells: StoredListing[];
  encounters: StoredListing[];
}
