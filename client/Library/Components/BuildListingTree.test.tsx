import * as React from "react";

import { render } from "@testing-library/react";
import { Listing } from "../Listing";
import { BuildListingTree } from "./BuildListingTree";
import { act } from "react-dom/test-utils";

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
    act(() => {
      rendered.getByText("Outer").click();
    });

    const innerFolder1 = rendered.getByText("Inner1");
    expect(innerFolder1).toBeTruthy();

    const innerFolder2 = rendered.getByText("Inner2");
    expect(innerFolder2).toBeTruthy();

    act(() => {
      rendered.getByText("Inner1").click();
    });

    const innerListing1 = rendered.getByText("Listing 1");
    expect(innerListing1).toBeTruthy();

    const innerListing2 = rendered.queryByText("Listing 2");
    expect(innerListing2).toBeFalsy();
  });
});
