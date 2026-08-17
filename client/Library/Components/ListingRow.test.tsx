import * as React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { SavedEncounter } from "../../../common/SavedEncounter";
import { Listing } from "../Listing";
import { ListingRow } from "./ListingRow";

function getElement(container: HTMLElement, selector: string) {
  return container.querySelector(selector) as HTMLElement;
}

describe("ListingRow rename", () => {
  test("supports optional inline rename and titles row actions", async () => {
    const encounter = {
      ...SavedEncounter.Default(),
      Id: "encounter-1",
      Name: "Goblin Ambush",
      Path: "Chapter 1"
    };
    const listing = new Listing<SavedEncounter>(
      {
        Id: encounter.Id,
        Name: encounter.Name,
        Path: encounter.Path,
        Link: "",
        SearchHint: "",
        FilterDimensions: {},
        LastUpdateMs: 0
      },
      "localAsync",
      encounter
    );
    const onRename = jest.fn().mockResolvedValue({ success: true });
    const rendered = render(
      <ListingRow
        name={encounter.Name}
        listing={listing}
        onAdd={() => true}
        onDelete={jest.fn()}
        onMove={jest.fn()}
        onPreview={jest.fn()}
        onRename={onRename}
      />
    );

    const deleteButton = getElement(rendered.container, ".c-listing-delete");
    const moveButton = getElement(rendered.container, ".c-listing-move");
    fireEvent.mouseEnter(deleteButton);
    expect(await rendered.findByText("Delete")).toBeTruthy();
    fireEvent.mouseLeave(deleteButton);
    fireEvent.mouseEnter(moveButton);
    expect(await rendered.findByText("Move")).toBeTruthy();
    fireEvent.mouseLeave(moveButton);
    expect(rendered.container.querySelector(".c-listing-preview")).toBeTruthy();

    const rename = getElement(rendered.container, ".c-listing-edit");
    fireEvent.mouseEnter(rename);
    expect(await rendered.findByText("Rename")).toBeTruthy();
    fireEvent.click(rename);
    const input = getElement(rendered.container, "input");
    fireEvent.change(input, { target: { value: "Finale" } });
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() =>
      expect(onRename).toHaveBeenCalledWith(listing, "Finale")
    );
  });

  test("omits rename when its callback is absent", async () => {
    const listing = new Listing<SavedEncounter>(
      {
        Id: "encounter-1",
        Name: "Goblin Ambush",
        Path: "",
        Link: "",
        SearchHint: "",
        FilterDimensions: {},
        LastUpdateMs: 0
      },
      "localAsync"
    );
    const rendered = render(
      <ListingRow
        name={listing.Meta().Name}
        listing={listing}
        onAdd={() => true}
        onEdit={jest.fn()}
      />
    );

    expect(rendered.container.querySelectorAll(".c-listing-edit")).toHaveLength(
      1
    );
    const edit = getElement(rendered.container, ".c-listing-edit");
    fireEvent.mouseEnter(edit);
    expect(await rendered.findByText("Edit")).toBeTruthy();
  });
});
