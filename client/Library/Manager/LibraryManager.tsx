import * as React from "react";
import { useState } from "react";
import { useSubscription } from "../../Combatant/linkComponentToObservables";
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
  const pageComponentsByTab = {
    Creatures: (
      <LibraryManagerPane
        listingsComputed={props.libraries.StatBlocks.GetStatBlocks}
      />
    ),
    Characters: (
      <LibraryManagerPane
        listingsComputed={props.libraries.PersistentCharacters.GetListings}
      />
    ),
    Spells: (
      <LibraryManagerPane listingsComputed={props.libraries.Spells.GetSpells} />
    ),
    Encounters: (
      <LibraryManagerPane
        listingsComputed={props.libraries.Encounters.Encounters}
      />
    )
  };

  const [activeTab, setActiveTab] = useState("Creatures");
  const [columnWidth, setColumnWidth] = useState(500);
  return (
    <div style={{ display: "flex", flexFlow: "row" }}>
      <div style={{ width: columnWidth }}>
        <Tabs
          options={Object.keys(pageComponentsByTab)}
          selected={activeTab}
          onChoose={setActiveTab}
        />
        {pageComponentsByTab[activeTab]}
      </div>
      <VerticalResizer
        adjustWidth={offset => setColumnWidth(columnWidth + offset)}
      />
      <div>Viewer/Editor</div>
    </div>
  );
}

function LibraryManagerPane(props: {
  listingsComputed: KnockoutObservable<Listing<any>[]>;
}) {
  const listings = useSubscription(props.listingsComputed);
  return (
    <div style={{ display: "flex", flexFlow: "column" }}>
      {listings.map(l => (
        <LibraryManagerRow key={l.Listing().Id} listing={l} />
      ))}
    </div>
  );
}

function LibraryManagerRow(props: { listing: Listing<any> }) {
  const listing = useSubscription(props.listing.Listing);
  return <div>{listing.Name}</div>;
}
