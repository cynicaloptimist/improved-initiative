import _ = require("lodash");
import moment = require("moment");
import * as React from "react";

export class CombatFooter extends React.Component<
  CombatFooterProps,
  CombatFooterState
> {
  constructor(props) {
    super(props);
    this.state = {
      timerElapsedSeconds: 0
    };
  }
  public render() {
    return (
      <div className="combat-footer">
        {this.props.timerVisible && (
          <span className="turn-timer">{this.getTimerReadout()}</span>
        )}
        {this.props.currentRound > 0 && (
          <span className="round-counter">
            Current Round: {this.props.currentRound}
          </span>
        )}
      </div>
    );
  }
  private getTimerReadout() {
    const time = moment.duration(this.state.timerElapsedSeconds, "seconds");
    const paddedSeconds = _.padStart(time.seconds().toString(), 2, "0");
    return time.minutes() + ":" + paddedSeconds;
  }
}
interface CombatFooterProps {
  currentRound?: number;
  timerVisible: boolean;
}
interface CombatFooterState {
  timerElapsedSeconds: number;
}
