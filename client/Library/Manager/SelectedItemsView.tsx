import * as React from "react";
import { useState } from "react";
import { Listable } from "../../../common/Listable";
import { Listing } from "../Listing";

export function SelectedItemsView<T extends Listable>(props: {
  listings: Listing<T>[];
  defaultListing: T;
  renderListing: (item: T) => JSX.Element;
  friendlyName: string;
}) {
  const [loadedItemsById, setLoadedItemsById] = useState<Record<string, T>>({});

  React.useEffect(() => {
    setLoadedItemsById({});
    props.listings.forEach(async listing => {
      const item = await listing.GetWithTemplate(props.defaultListing);
      setLoadedItemsById(loaded => ({
        ...loaded,
        [listing.Meta().Id]: item
      }));
    });
  }, [props.listings]);

  const loadedItems = Object.values(loadedItemsById);

  if (loadedItems.length === 0) {
    return null;
  }
  if (props.listings.length === 1 && loadedItems.length === 1) {
    return props.renderListing(loadedItems[0]);
  } else {
    return (
      <div className="c-statblock-header">
        <h2>Selected {props.friendlyName}</h2>
        {props.listings.map(listing => {
          return (
            <h3 key={listing.Meta().Id} className="Name">
              {listing.Meta().Name}
            </h3>
          );
        })}
      </div>
    );
  }
}
