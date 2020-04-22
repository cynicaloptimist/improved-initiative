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
  const allEvents = useSubscription(props.eventLog.Events);
  const elapsedRounds = useSubscription(
    props.encounter.EncounterFlow.CombatTimer.ElapsedRounds
  );
  const encounterDifficulty = useSubscription(props.encounter.Difficulty);

  const [fullLogVisible, setFullLogVisible] = React.useState(false);
  const togglerButtonCSS = fullLogVisible ? "fa-caret-down" : "fa-caret-up";

  return (
    <div className="combat-footer">
      {fullLogVisible && <FullEventLog eventsTail={allEvents.slice(1)} />}
      <div className="footer-bar">
        <i
          className={"fa-clickable " + togglerButtonCSS}
          onClick={() => setFullLogVisible(!fullLogVisible)}
        ></i>
        <span
          className="latest-event"
          dangerouslySetInnerHTML={{ __html: allEvents[0] }}
        />
        {settingsContext.TrackerView.DisplayTurnTimer && (
          <TurnTimerReadout
            observableReadout={props.encounter.EncounterFlow.TurnTimerReadout}
          />
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

function FullEventLog(props: { eventsTail: string[] }) {
  const eventsEndRef = React.useRef(null);

  const scrollToBottom = () => {
    eventsEndRef.current.scrollIntoView(true);
  };

  React.useEffect(scrollToBottom, []);

  return (
    <ul className="event-log">
      {props.eventsTail.reverse().map((eventHtml, index) => (
        <li key={index} dangerouslySetInnerHTML={{ __html: eventHtml }} />
      ))}
      <div ref={eventsEndRef} />
    </ul>
  );
}

function TurnTimerReadout(props: {
  observableReadout: KnockoutObservable<string>;
}) {
  const turnTimerReadout = useSubscription(props.observableReadout);

  return <span className="turn-timer">{turnTimerReadout}</span>;
}
