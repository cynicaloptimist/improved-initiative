import * as ko from "knockout";
import * as React from "react";

import { Spell } from "../../../common/Spell";
import { SubmitButton } from "../../Components/Button";
import { SpellDetails } from "../../Library/Components/SpellDetails";
import { Listing } from "../../Library/Listing";
import { TextEnricher } from "../../TextEnricher/TextEnricher";
import { LegacyPrompt } from "./Prompt";

interface SpellPromptProps {
  Spell: Spell;
  TextEnricher: TextEnricher;
}

class SpellPromptComponent extends React.Component<SpellPromptProps> {
  public render() {
    return (
      <React.Fragment>
        <SpellDetails {...this.props} />
        <SubmitButton />
      </React.Fragment>
    );
  }
}

export class SpellPrompt implements LegacyPrompt {
  public InputSelector = "button";
  public ComponentName = "reactprompt";

  protected component = ko.observable();

  constructor(listing: Listing<Spell>, private textEnricher: TextEnricher) {
    listing.GetAsyncWithUpdatedId(unsafeSpell => {
      const spell = { ...Spell.Default(), ...unsafeSpell };
      this.component(
        <SpellPromptComponent Spell={spell} TextEnricher={this.textEnricher} />
      );
    });
  }

  public Resolve = () => {};
}
