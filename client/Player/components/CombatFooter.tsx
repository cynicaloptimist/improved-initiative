import _ = require("lodash");
import moment = require("moment");
import * as React from "react";

export class CombatFooter extends React.Component<
  CombatFooterProps,
  CombatFooterState
> {
  private timerInterval: number;

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

  public componentDidUpdate(prevProps: CombatFooterProps) {
    this.resetTimerIfCombatantChanged(prevProps.activeCombatantId);
  }

  public componentDidMount() {
    this.timerInterval = window.setInterval(this.incrementTimer, 1000);
  }

  public componentWillUnmount() {
    clearInterval(this.timerInterval);
  }

  private getTimerReadout() {
    const time = moment.duration(this.state.timerElapsedSeconds, "seconds");
    const paddedSeconds = _.padStart(time.seconds().toString(), 2, "0");
    return time.minutes() + ":" + paddedSeconds;
  }

  private resetTimerIfCombatantChanged(prevActiveCombatantId) {
    const newCombatantIsActive =
      prevActiveCombatantId != this.props.activeCombatantId;
    if (newCombatantIsActive) {
      this.setState({
        timerElapsedSeconds: 0
      });
    }
  }

  private incrementTimer = () => {
    this.setState(state => ({
      timerElapsedSeconds: state.timerElapsedSeconds + 1
    }));
  };
}
interface CombatFooterProps {
  currentRound?: number;
  timerVisible: boolean;
  activeCombatantId: string;
}
interface CombatFooterState {
  timerElapsedSeconds: number;
}
