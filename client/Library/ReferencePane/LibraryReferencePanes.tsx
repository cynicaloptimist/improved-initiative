import * as React from "react";
import { LibrariesCommander } from "../../Commands/LibrariesCommander";
import { Button } from "../../Components/Button";
import { Tabs } from "../../Components/Tabs";
import { env } from "../../Environment";
import { TextEnricher } from "../../TextEnricher/TextEnricher";
import { TutorialSpy } from "../../Tutorial/TutorialSpy";
import { Libraries } from "../Libraries";
import { EncounterLibraryReferencePane } from "./EncounterLibraryReferencePane";
import { PersistentCharacterLibraryReferencePane } from "./PersistentCharacterLibraryReferencePane";
import { SpellLibraryReferencePane } from "./SpellLibraryReferencePane";
import { StatBlockLibraryReferencePane } from "./StatBlockLibraryReferencePane";

export interface LibraryReferencePanesProps {
  librariesCommander: LibrariesCommander;
  statBlockTextEnricher: TextEnricher;
  libraries: Libraries;
}

interface State {
  selectedLibrary: string;
}

export class LibraryReferencePanes extends React.Component<LibraryReferencePanesProps, State> {
  constructor(props) {
    super(props);
    this.state = {
      selectedLibrary: "Creatures"
    };
  }

  private hideLibraries = () => this.props.librariesCommander.HideLibraries();
  private selectLibrary = (library: string) => {
    if (library == "Characters") {
      TutorialSpy("SelectCharactersTab");
    }
    this.setState({ selectedLibrary: library });
  };

  public render() {
    const libraries = {
      Creatures: (
        <StatBlockLibraryReferencePane
          librariesCommander={this.props.librariesCommander}
          library={this.props.libraries.StatBlocks}
          statBlockTextEnricher={this.props.statBlockTextEnricher}
        />
      ),
      Characters: (
        <PersistentCharacterLibraryReferencePane
          librariesCommander={this.props.librariesCommander}
          library={this.props.libraries.PersistentCharacters}
          statBlockTextEnricher={this.props.statBlockTextEnricher}
        />
      ),
      Encounters: (
        <EncounterLibraryReferencePane
          librariesCommander={this.props.librariesCommander}
          library={this.props.libraries.Encounters}
        />
      ),
      Spells: (
        <SpellLibraryReferencePane
          librariesCommander={this.props.librariesCommander}
          library={this.props.libraries.Spells}
          textEnricher={this.props.statBlockTextEnricher}
        />
      )
    };

    const selectedLibrary = libraries[this.state.selectedLibrary];

    const hasAccountSync = env.HasStorage;

    return (
      <div className="libraries">
        <div className="libraries__header">
          <h2>
            {hasAccountSync && (
              <span className="fas fa-cloud" title="Account Sync is enabled" />
            )}{" "}
            Library
          </h2>
          <Button
            additionalClassNames="button--close"
            fontAwesomeIcon="times"
            onClick={this.hideLibraries}
          />
        </div>
        <Tabs
          options={Object.keys(libraries)}
          onChoose={this.selectLibrary}
          selected={this.state.selectedLibrary}
        />
        {selectedLibrary}
      </div>
    );
  }
}
