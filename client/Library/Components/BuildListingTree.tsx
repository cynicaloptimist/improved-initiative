import * as _ from "lodash";
import * as React from "react";
import { Listable } from "../../../common/Listable";
import { Listing } from "../Listing";
import { Folder } from "./Folder";

export type ListingGroupFn = (
  l: Listing<any>
) => { label?: string; key: string };

export function BuildListingTree<T extends Listable>(
  buildListingComponent: (listing: Listing<T>) => JSX.Element,
  groupListingsBy: ListingGroupFn,
  listings: Listing<T>[]
): JSX.Element[] {
  const rootListingComponents: JSX.Element[] = [];
  const foldersByKey: {
    [key: string]: {
      label: string;
      listings: Listing<T>[];
    };
  } = {};

  listings.forEach(listing => {
    const group = groupListingsBy(listing);
    if (group.key == "") {
      const component = buildListingComponent(listing);

      rootListingComponents.push(component);
    } else {
      if (foldersByKey[group.key] == undefined) {
        foldersByKey[group.key] = {
          label: group.label || group.key,
          listings: []
        };
      }
      foldersByKey[group.key].listings.push(listing);
    }
  });

  const folderComponents = Object.keys(foldersByKey)
    .sort()
    .map(key => {
      const folderLabel = foldersByKey[key].label;
      const listings = foldersByKey[key].listings;
      const listingComponents = listings.map(buildListingComponent);
      return (
        <Folder key={folderLabel} name={folderLabel}>
          {listingComponents}
        </Folder>
      );
    });

  return folderComponents.concat(rootListingComponents);
}
