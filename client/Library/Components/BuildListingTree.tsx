import * as _ from "lodash";
import * as React from "react";
import { Listable } from "../../../common/Listable";
import { Listing } from "../Listing";
import { Folder } from "./Folder";

export type ListingGroupFn = (
  l: Listing<any>
) => { label?: string; key: string };

type Folder = {
  label: string;
  listings: Listing<any>[];
  subFoldersByKey: Record<string, Folder>;
};

export function BuildListingTree<T extends Listable>(
  buildListingComponent: (listing: Listing<T>) => JSX.Element,
  groupListingsBy: ListingGroupFn,
  listings: Listing<T>[]
): JSX.Element[] {
  const rootListingComponents: JSX.Element[] = [];

  const foldersByKey: Record<string, Folder> = {};

  listings.forEach(listing => {
    const group = groupListingsBy(listing);
    if (group.key == "" || group.key === undefined) {
      const component = buildListingComponent(listing);

      rootListingComponents.push(component);
    } else {
      const innerFolder = ensureFolder(foldersByKey, group.key);
      innerFolder.listings.push(listing);
    }
  });

  const folderComponents = buildFolderComponents<T>(
    foldersByKey,
    buildListingComponent
  );

  return folderComponents.concat(rootListingComponents);
}

function buildFolderComponents<T extends Listable>(
  foldersByKey: Record<string, Folder>,
  buildListingComponent: (listing: Listing<T>) => JSX.Element
) {
  return Object.keys(foldersByKey)
    .sort()
    .map(key => {
      const folder = foldersByKey[key];
      const listingComponents = folder.listings.map(buildListingComponent);
      return (
        <Folder key={folder.label} name={folder.label}>
          {buildFolderComponents(folder.subFoldersByKey, buildListingComponent)}
          {listingComponents}
        </Folder>
      );
    });
}

function ensureFolder(outerFolder: Record<string, Folder>, keyString: string) {
  const path = keyString.split("/");
  let folderCursor = outerFolder;
  for (let i = 0; i < path.length; i++) {
    const folderName = path[i];
    if (folderCursor[folderName] === undefined) {
      folderCursor[folderName] = {
        label: folderName,
        listings: [],
        subFoldersByKey: {}
      };
    }

    if (i === path.length - 1) {
      return folderCursor[folderName];
    }

    folderCursor = folderCursor[folderName].subFoldersByKey;
  }
}
