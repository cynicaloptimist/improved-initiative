import React = require("react");
import { Selection } from "./useSelection";
import { Listing } from "../Listing";

export const ListingSelectionContext = React.createContext<
  Selection<Listing<any>>
>({
  selected: [],
  setSelected: () => {},
  addSelected: () => {},
  removeSelected: () => {},
  clearSelected: () => {}
});
