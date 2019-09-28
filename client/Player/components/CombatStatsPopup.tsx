import * as React from "react";
import { CombatStats } from "../../../common/CombatStats";
import { SubmitButton } from "../../Components/Button";
import { GetTimerReadout } from "../../Widgets/GetTimerReadout";

export class CombatStatsPopup extends React.Component<CombatStatsProps> {
  private totalPlayerTime = this.props.stats.combatants
    .map(c => c.elapsedSeconds)
    .reduce((total, curr) => total + curr, 0);
  private dmElapsedSeconds =
    this.props.stats.elapsedSeconds - this.totalPlayerTime;

  public render() {
    return (
      <form onSubmit={this.props.onClose} className="combat-stats-popup">
        <div className="combat-stats">
          <div className="combat-stats__header">
            <h4>Post-Combat Breakdown</h4>
            <SubmitButton />
          </div>
          <ul className={"playercharacters"}>
            {this.props.stats.combatants.map((c, index) => (
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
                <strong>{this.props.stats.elapsedRounds}</strong>
                {" rounds, taking "}
                <strong>
                  {GetTimerReadout(this.props.stats.elapsedSeconds)}
                </strong>
                {", for an average of "}
                <strong>
                  {GetTimerReadout(
                    this.props.stats.elapsedSeconds /
                      this.props.stats.elapsedRounds
                  )}
                </strong>
                {" per round."}
              </span>
            </li>
            <li key={1}>
              <span>
                {"The DM took, on average "}
                <strong>
                  {GetTimerReadout(
                    this.dmElapsedSeconds / this.props.stats.elapsedRounds
                  )}
                </strong>
                {" per round."}
              </span>
            </li>
          </ul>
        </div>
      </form>
    );
  }
}

interface CombatStatsProps {
  stats: CombatStats;
  onClose: () => void;
}
