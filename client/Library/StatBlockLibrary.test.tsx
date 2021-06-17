import * as React from "react";
import { act, render } from "@testing-library/react";
import { StatBlock } from "../../common/StatBlock";
import { Store } from "../Utility/Store";
import { Library, useLibrary } from "./useLibrary";

function LibraryTest(props: {
  libraryRef: (library: Library<StatBlock>) => void;
}) {
  const library = useLibrary(Store.StatBlocks, "statblocks", {
    createEmptyListing: () => StatBlock.Default(),
    accountSave: () => {},
    accountDelete: () => {},
    getFilterDimensions: () => ({}),
    getSearchHint: () => ""
  });

  props.libraryRef(library);
  return <div />;
}

describe("StatBlock Library", () => {
  test("Saves statblock name and max HP", async () => {
    localStorage.clear();

    await Store.Save(Store.StatBlocks, "creatureId", {
      ...StatBlock.Default(),
      Name: "Saved Creature",
      HP: { Value: 10 }
    });

    let library: Library<StatBlock>;
    act(() => {
      render(<LibraryTest libraryRef={l => (library = l)} />);
      library.AddListings(
        [
          {
            Name: "Saved Creature",
            Id: "creatureId",
            Link: Store.StatBlocks,
            Path: "",
            FilterDimensions: {},
            SearchHint: "",
            LastUpdateMs: 0
          }
        ],
        "localAsync"
      );
    });

    const listing = library.GetAllListings()[0];
    const statBlockFromLibrary = await listing.GetWithTemplate(
      StatBlock.Default()
    );

    expect(statBlockFromLibrary.Name).toEqual("Saved Creature");
    expect(statBlockFromLibrary.HP.Value).toEqual(10);
  });
});
