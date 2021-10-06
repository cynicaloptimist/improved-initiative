import * as React from "react";
import axios from "axios";
import { act, render } from "@testing-library/react";
import { StatBlock } from "../../common/StatBlock";
import { Store } from "../Utility/Store";
import { Library, useLibrary } from "./useLibrary";

jest.mock("axios");

function LibraryTest(props: {
  libraryRef: (library: Library<StatBlock>) => void;
  loadingFinished: () => void;
}) {
  const library = useLibrary(Store.StatBlocks, "statblocks", {
    createEmptyListing: () => StatBlock.Default(),
    accountSave: () => {},
    accountDelete: () => {},
    getFilterDimensions: () => ({}),
    getSearchHint: () => "",
    loadingFinished: props.loadingFinished
  });

  props.libraryRef(library);
  return <div />;
}

describe("StatBlock Library", () => {
  test("Saves statblock name and max HP", async () => {
    localStorage.clear();
    (axios.get as jest.Mock).mockResolvedValue(false);

    await Store.Save(Store.StatBlocks, "creatureId", {
      ...StatBlock.Default(),
      Name: "Saved Creature",
      HP: { Value: 10 }
    });

    let library: Library<StatBlock>;

    await act(async () => {
      await new Promise<void>(done => {
        render(
          <LibraryTest
            libraryRef={l => (library = l)}
            loadingFinished={() => done()}
          />
        );
      });

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
