import * as React from "react";
import { useState } from "react";
import { LibrariesCommander } from "../../Commands/LibrariesCommander";
import { Tabs } from "../../Components/Tabs";
import { VerticalResizer } from "../../Layout/VerticalResizer";
import { TextEnricher } from "../../TextEnricher/TextEnricher";
import { Libraries } from "../Libraries";
import { Listing } from "../Listing";

export function LibraryManager(props: {
  librariesCommander: LibrariesCommander;
  statBlockTextEnricher: TextEnricher;
  libraries: Libraries;
}) {
  const tabs = {
    Creatures: (
      <LibraryManagerPane
        listings={props.libraries.StatBlocks.GetStatBlocks()}
      />
    ),
    Characters: (
      <LibraryManagerPane
        listings={props.libraries.PersistentCharacters.GetListings()}
      />
    ),
    Spells: (
      <LibraryManagerPane listings={props.libraries.Spells.GetSpells()} />
    ),
    Encounters: (
      <LibraryManagerPane listings={props.libraries.Encounters.Encounters()} />
    )
  };

  const [activeTab, setActiveTab] = useState("Creatures");
  const [columnWidth, setColumnWidth] = useState(500);
  return (
    <div style={{ display: "flex", flexFlow: "row" }}>
      <div style={{ width: columnWidth }}>
        <Tabs
          options={Object.keys(tabs)}
          selected={activeTab}
          onChoose={setActiveTab}
        />
        {tabs[activeTab]}
      </div>
      <VerticalResizer
        adjustWidth={offset => setColumnWidth(columnWidth + offset)}
      />
      <div>Viewer/Editor</div>
    </div>
  );
}

function LibraryManagerPane(props: { listings: Listing<any>[] }) {
  return <div>{props.listings.map(l => l.Listing().Name)}</div>;
}
