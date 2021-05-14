import * as React from "react";
import { useSubscription } from "../../Combatant/linkComponentToObservables";
import { ListingButton } from "../Components/ListingButton";
import { Listing } from "../Listing";
import { SelectionContext, Selection } from "./SelectionContext";

export function LibraryManagerRow(props: {
  listing: Listing<any>;
  setEditorTarget: (item: Listing<any>) => void;
}) {
  const listingMeta = useSubscription(props.listing.Meta);
  const selection = React.useContext<Selection<Listing<any>>>(SelectionContext);
  const isSelected = selection.selected.includes(props.listing);
  return (
    <li className={"c-listing" + (isSelected ? " c-listing--selected" : "")}>
      <ListingButton
        buttonClass="select"
        text={listingMeta.Name}
        onClick={mouseEvent => {
          if (mouseEvent.ctrlKey || mouseEvent.metaKey) {
            selection.addSelected(props.listing);
          } else {
            selection.setSelected(props.listing);
          }
        }}
      />
      <ListingButton
        buttonClass="edit"
        faClass="edit"
        onClick={async e => {
          e.stopPropagation();
          props.setEditorTarget(props.listing);
        }}
      ></ListingButton>
    </li>
  );
}
