import * as React from "react";

import { render } from "@testing-library/react";
import { Listing } from "../Listing";
import { BuildListingTree } from "./BuildListingTree";

describe("BuildListingTree", () => {
  it("Renders nested folders", () => {
    const listingTree = BuildListingTree(
      listing => <div key={listing.Meta().Id}>{listing.Meta().Name}</div>,
      listing => {
        return { key: listing.Meta().Path };
      },
      [
        new Listing(
          {
            Name: "Listing 1",
            Id: "1",
            Path: "Outer/Inner1",
            LastUpdateMs: 0,
            FilterDimensions: {},
            Link: "",
            SearchHint: ""
          },
          "localAsync"
        ),
        new Listing(
          {
            Name: "Listing 2",
            Id: "1",
            Path: "Outer/Inner2",
            LastUpdateMs: 0,
            FilterDimensions: {},
            Link: "",
            SearchHint: ""
          },
          "localAsync"
        )
      ]
    );
    const rendered = render(<div>{listingTree}</div>);
    const outerFolder = rendered.getByText("Outer");
    expect(outerFolder).toBeTruthy();
  });
});
