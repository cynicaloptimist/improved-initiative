import { ListingMeta } from "../../common/Listable";
import { Settings } from "../../common/Settings";

export interface Account {
  settings: Settings;
  statblocks: ListingMeta[];
  playercharacters: ListingMeta[];
  persistentcharacters: ListingMeta[];
  spells: ListingMeta[];
  encounters: ListingMeta[];
}
