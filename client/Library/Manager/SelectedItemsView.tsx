import * as React from "react";
import { useState } from "react";
import { Listable } from "../../../common/Listable";
import { Listing } from "../Listing";

export function SelectedItemsView<T extends Listable>(props: {
  listings: Listing<T>[];
  defaultListing: T;
  renderListing: (item: T) => JSX.Element;
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
    return <LibraryManagerInfo />;
  }
  if (props.listings.length === 1 && loadedItems.length === 1) {
    return props.renderListing(loadedItems[0]);
  } else {
    return (
      <div className="c-statblock-header">
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

function LibraryManagerInfo() {
  return (
    <div className="c-library-manager__info">
      <p>
        The Library Manager allows you to move, delete, or export multiple items
        at the same time. Select multiple rows by holding the control/meta key.
        You can also edit one item while viewing another item.
      </p>
    </div>
  );
}
