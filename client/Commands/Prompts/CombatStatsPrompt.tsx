import React = require("react");
import { CombatStats } from "../../../common/CombatStats";
import { SubmitButton } from "../../Components/Button";
import { GetTimerReadout } from "../../Widgets/GetTimerReadout";
import { PromptProps } from "./PendingPrompts";

export const CombatStatsPrompt = (stats: CombatStats): PromptProps<{}> => {
  const totalPlayerTime = stats.combatants
    .map(c => c.elapsedSeconds)
    .reduce((total, curr) => total + curr, 0);
  const dmElapsedSeconds = stats.elapsedSeconds - totalPlayerTime;

  return {
    onSubmit: () => true,

    initialValues: {},

    autoFocusSelector: ".autofocus",

    children: (
      <div className="combat-stats">
        <div className="combat-stats__header">
          <h4>Post-Combat Breakdown</h4>
          <SubmitButton />
        </div>
        <ul className={"playercharacters"}>
          {stats.combatants.map((c, index) => (
            <li key={index}>
              <span>
                <strong>{c.displayName}</strong>
                {" participated in "}
                <strong>{c.elapsedRounds}</strong>
                {" rounds, averaging "}
                <strong>
                  {GetTimerReadout(c.elapsedSeconds / c.elapsedRounds)}
                </strong>
                {" per round."}
              </span>
            </li>
          ))}
        </ul>
        <ul className={"nonplayercharacters"}>
          <li key={0}>
            <span>
              {"Combat lasted "}
              <strong>{stats.elapsedRounds}</strong>
              {" rounds, taking "}
              <strong>{GetTimerReadout(stats.elapsedSeconds)}</strong>
              {", for an average of "}
              <strong>
                {GetTimerReadout(stats.elapsedSeconds / stats.elapsedRounds)}
              </strong>
              {" per round."}
            </span>
          </li>
          <li key={1}>
            <span>
              {"The DM took, on average "}
              <strong>
                {GetTimerReadout(dmElapsedSeconds / stats.elapsedRounds)}
              </strong>
              {" per round."}
            </span>
          </li>
        </ul>
      </div>
    )
  };
};
