import * as React from "react";

import { Spell } from "../../common/Spell";
import { SpellDetails } from "../Library/Components/SpellDetails";
import { PromptProps } from "./PendingPrompts";
import { Listing } from "../Library/Listing";
import { useAsyncListing } from "../Utility/useAsyncListing";

export function SpellPrompt(
  spellListing: Listing<Spell>
): PromptProps<Record<string, never>> {
  return {
    autoFocusSelector: "button",
    children: <SpellPromptComponent spellListing={spellListing} />,
    initialValues: {},
    onSubmit: () => true
  };
}

function SpellPromptComponent(props: {
  spellListing: Listing<Spell>;
}): React.ReactElement {
  const [spell, loading, error] = useAsyncListing(props.spellListing);

  if (error) {
    return (
      <div className="prompt-spell">
        <div className="spell">
          <h3>{props.spellListing.Meta().Name}</h3>
          <p>Error loading spell: {error}</p>
        </div>
      </div>
    );
  }

  if (loading || !spell) {
    return (
      <div className="prompt-spell">
        <div className="spell">
          <h3>{props.spellListing.Meta().Name}</h3>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="prompt-spell">
      <SpellDetails Spell={spell} />
    </div>
  );
}
