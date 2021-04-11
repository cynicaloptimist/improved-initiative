import * as React from "react";
import { useSubscription } from "../../Combatant/linkComponentToObservables";
import { Listing } from "../Listing";
import { SelectionContext, Selection } from "./SelectionContext";

export function LibraryManagerRow(props: { listing: Listing<any> }) {
  const listingMeta = useSubscription(props.listing.Meta);
  const selection = React.useContext<Selection<Listing<any>>>(SelectionContext);
  const isSelected = selection.selected.includes(props.listing);
  return (
    <div
      style={{
        backgroundColor: isSelected ? "red" : undefined,
        userSelect: "none"
      }}
      onClick={mouseEvent => {
        if (mouseEvent.ctrlKey || mouseEvent.metaKey) {
          selection.addSelected(props.listing);
        } else {
          selection.setSelected(props.listing);
        }
      }}
    >
      {listingMeta.Name}
    </div>
  );
}
