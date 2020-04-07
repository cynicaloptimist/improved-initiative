import * as React from "react";
import { EventLog } from "../Widgets/EventLog";
import { Encounter } from "../Encounter/Encounter";
import { SettingsContext } from "../Settings/SettingsContext";
import { useSubscription } from "../Combatant/linkComponentToObservables";
import { EncounterDifficulty } from "../Widgets/DifficultyCalculator";

type CombatFooterProps = {
  eventLog: EventLog;
  encounter: Encounter;
};

export function CombatFooter(props: CombatFooterProps) {
  const settingsContext = React.useContext(SettingsContext);
  const showFullLog = useSubscription(props.eventLog.ShowFullLog);
  const eventsTail = useSubscription(props.eventLog.EventsTail);
  const togglerButtonCSS = useSubscription(props.eventLog.ToggleCSS);
  const latestEvent = useSubscription(props.eventLog.LatestEvent);
  const turnTimerReadout = useSubscription(
    props.encounter.EncounterFlow.TurnTimerReadout
  );
  const elapsedRounds = useSubscription(
    props.encounter.EncounterFlow.CombatTimer.ElapsedRounds
  );
  const encounterDifficulty = useSubscription(props.encounter.Difficulty);

  return (
    <div className="combat-footer">
      {showFullLog && (
        <ul className="event-log">
          {eventsTail.map((eventHtml, index) => (
            <li key={index} dangerouslySetInnerHTML={{__html: eventHtml}} />
          ))}
        </ul>
      )}
      <div className="footer-bar">
        <i
          className={"fa-clickable " + togglerButtonCSS}
          onClick={props.eventLog.ToggleFullLog}
        ></i>
        <span
          className="latest-event"
          dangerouslySetInnerHTML={{ __html: latestEvent }}
        />
        {settingsContext.TrackerView.DisplayTurnTimer && (
          <span className="turn-timer">{turnTimerReadout}</span>
        )}
        {settingsContext.TrackerView.DisplayRoundCounter && (
          <span className="round-counter">Current Round: {elapsedRounds}</span>
        )}
        {settingsContext.TrackerView.DisplayDifficulty && (
          <span className="encounter-challenge">
            {getDifficultyString(encounterDifficulty)}
          </span>
        )}
      </div>
    </div>
  );
}

function getDifficultyString(difficulty: EncounterDifficulty) {
  const xpString = difficulty.EarnedExperience + " XP";
  if (difficulty.Difficulty.length == 0) {
    return xpString;
  }
  return difficulty.Difficulty + ": " + xpString;
}
