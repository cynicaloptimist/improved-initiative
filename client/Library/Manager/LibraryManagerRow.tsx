import Tippy from "@tippyjs/react";
import * as React from "react";
import { useSubscription } from "../../Combatant/linkComponentToObservables";
import { ListingButton } from "../Components/ListingButton";
import { Listing, ListingOrigin } from "../Listing";
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
        buttonClass={
          "toggle-select " +
          (isSelected ? "fas fa-check-circle" : "far fa-circle")
        }
        onClick={async e => {
          e.stopPropagation();
          if (!isSelected) {
            selection.addSelected(props.listing);
          } else {
            selection.removeSelected(props.listing);
          }
        }}
      />
      <ListingButton
        buttonClass="select c-listing-button--wide"
        text={listingMeta.Name}
        onClick={mouseEvent => {
          if (mouseEvent.ctrlKey || mouseEvent.metaKey) {
            selection.addSelected(props.listing);
          } else {
            selection.setSelected(props.listing);
          }
        }}
      />
      <SourceIndicator source={props.listing.Origin} />
      <ListingButton
        buttonClass="edit"
        faClass="edit"
        onClick={async e => {
          e.stopPropagation();
          props.setEditorTarget(props.listing);
        }}
      />
    </li>
  );
}

function SourceIndicator(props: { source: ListingOrigin }) {
  if (props.source === "server")
    return (
      <Tippy content="Basic Rules">
        <i className="fab fa-d-and-d c-listing-indicator" />
      </Tippy>
    );

  if (props.source === "account")
    return (
      <Tippy content="Account Sync">
        <i className="fas fa-cloud c-listing-indicator" />
      </Tippy>
    );

  if (props.source === "localAsync")
    return (
      <Tippy content="Local Storage">
        <i className="fas fa-hdd c-listing-indicator" />
      </Tippy>
    );

  return null;
}
