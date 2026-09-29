import * as React from "react";
import * as Mousetrap from "mousetrap";
import { CommandContext } from "./CommandContext";
import { Button } from "../Components/Button";
import { SettingsContext } from "../Settings/SettingsContext";

export const RestoreCombatants = () => {
  const { CombatantsPendingRemove, RestoreCombatants, FlushCombatants } =
    React.useContext(CommandContext);
  const { TrackerView } = React.useContext(SettingsContext);

  const restoreCombatants = React.useCallback(() => {
    RestoreCombatants();
  }, [CombatantsPendingRemove, RestoreCombatants]);

  React.useEffect(() => {
    Mousetrap.bind("ctrl+z", restoreCombatants);
    return () => {
      Mousetrap.unbind("ctrl+z");
    };
  }, [restoreCombatants]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      FlushCombatants();
    }, 8000);
    return () => clearTimeout(timer);
  }, [FlushCombatants, CombatantsPendingRemove.length]);

  if (
    CombatantsPendingRemove.length === 0 ||
    TrackerView.DisplayRestoreCombatants === false
  ) {
    return null;
  }

  return (
    <div className="removed-combatants">
      {getCombatantsRemovedMessage(
        CombatantsPendingRemove[0].DisplayName(),
        CombatantsPendingRemove.length
      )}
      <Button onClick={restoreCombatants} text="Restore" />
      <Button
        onClick={() => FlushCombatants()}
        text="Dismiss"
        key={CombatantsPendingRemove.map(c => c.Id).join("-")}
        additionalClassNames="button-expires"
      />
    </div>
  );
};

function getCombatantsRemovedMessage(
  combatantName: string,
  combatantsCount: number
) {
  if (combatantsCount === 1) {
    return (
      <span>
        <strong>{combatantName}</strong> removed from encounter.
      </span>
    );
  } else {
    return (
      <span>
        <strong>{combatantName}</strong> and {combatantsCount - 1} other
        combatants removed from encounter.
      </span>
    );
  }
}
