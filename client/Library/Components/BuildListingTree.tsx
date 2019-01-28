import * as _ from "lodash";
import * as React from "react";
import { Listable } from "../../../common/Listable";
import { Listing } from "../Listing";
import { Folder } from "./Folder";

export function BuildListingTree<T extends Listable>(
  buildListingComponent: (listing: Listing<T>) => JSX.Element,
  listings: Listing<T>[]
): JSX.Element[] {
  const rootListingComponents = [];
  const folders = {};
  listings.forEach(listing => {
    if (listing.CurrentPath() == "") {
      const component = buildListingComponent(listing);

      rootListingComponents.push(component);
    } else {
      if (folders[listing.CurrentPath()] == undefined) {
        folders[listing.CurrentPath()] = [];
      }
      folders[listing.CurrentPath()].push(listing);
    }
  });

  const folderComponents = _.map(
    folders,
    (listings: Listing<T>[], folderName: string) => {
      const listingComponents = listings.map(buildListingComponent);
      return (
        <Folder key={folderName} name={folderName}>
          {listingComponents}
        </Folder>
      );
    }
  );

  return folderComponents.concat(rootListingComponents);
}
