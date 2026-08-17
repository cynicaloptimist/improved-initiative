import * as React from "react";

import { fireEvent, render, waitFor } from "@testing-library/react";
import { Listing } from "../Listing";
import { BuildListingTree } from "./BuildListingTree";
import { act } from "react-dom/test-utils";

describe("BuildListingTree", () => {
  it("Renders nested folders", () => {
    const listingTree = BuildListingTree(
      listing => <div key={listing.Meta().Id}>{listing.Meta().Name}</div>,
      {
        groupFn: listing => {
          return { key: listing.Meta().Path };
        }
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
    expect(rendered.container.querySelector(".c-listing-edit")).toBeNull();
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

  it("Propagates optional rename behavior with the complete folder path", async () => {
    const onRenameFolder = jest.fn().mockResolvedValue({ success: true });
    const listingTree = BuildListingTree(
      listing => <div key={listing.Meta().Id}>{listing.Meta().Name}</div>,
      {
        groupFn: listing => ({ key: listing.Meta().Path })
      },
      [
        new Listing(
          {
            Name: "Listing 1",
            Id: "1",
            Path: "Outer/Inner",
            LastUpdateMs: 0,
            FilterDimensions: {},
            Link: "",
            SearchHint: ""
          },
          "localAsync"
        )
      ],
      onRenameFolder
    );
    const rendered = render(<div>{listingTree}</div>);

    fireEvent.click(rendered.getByText("Outer"));
    fireEvent.click(rendered.getByText("Inner"));
    const innerFolderRow = rendered
      .getByText("Inner")
      .closest("li") as HTMLElement;
    fireEvent.click(
      innerFolderRow.querySelector(".c-listing-edit") as HTMLElement
    );
    const input = innerFolderRow.querySelector("input") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "Renamed" } });
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() =>
      expect(onRenameFolder).toHaveBeenCalledWith("Outer/Inner", "Renamed")
    );
  });
});
