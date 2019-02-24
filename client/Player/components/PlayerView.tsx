import * as React from "react";

import _ = require("lodash");
import { PlayerViewCombatantState } from "../../../common/PlayerViewCombatantState";
import { PlayerViewState } from "../../../common/PlayerViewState";
import { CombatFooter } from "./CombatFooter";
import { CustomStyles } from "./CustomStyles";
import { DamageSuggestor } from "./DamageSuggestor";
import { PlayerViewCombatant } from "./PlayerViewCombatant";
import { PlayerViewCombatantHeader } from "./PlayerViewCombatantHeader";
import { PortraitModal } from "./PortraitModal";

interface LocalState {
  showPortrait: boolean;
  portraitWasRequestedByClick: boolean;
  portraitURL: string;
  portraitCaption: string;

  suggestDamageCombatant: PlayerViewCombatantState;
}

interface OwnProps {
  onSuggestDamage: any;
}

export class PlayerView extends React.Component<
  PlayerViewState & OwnProps,
  LocalState
> {
  private modalTimeout: number;

  constructor(props) {
    super(props);
    this.state = {
      showPortrait: false,
      portraitWasRequestedByClick: false,
      portraitURL: "",
      portraitCaption: "",

      suggestDamageCombatant: null
    };
  }

  public render() {
    const footerVisible =
      this.props.settings.DisplayRoundCounter ||
      this.props.settings.DisplayTurnTimer;

    const acColumnVisible = this.props.encounterState.Combatants.some(
      c => c.AC != undefined
    );

    return (
      <div className="c-player-view">
        <CustomStyles
          CustomCSS={this.props.settings.CustomCSS}
          CustomStyles={this.props.settings.CustomStyles}
        />
        {this.state.showPortrait && (
          <PortraitModal
            imageURL={this.state.portraitURL}
            caption={this.state.portraitCaption}
            onClose={this.closePortrait}
          />
        )}
        {this.state.suggestDamageCombatant && (
          <DamageSuggestor
            combatant={this.state.suggestDamageCombatant}
            onClose={this.cancelSuggestion}
            onApply={this.props.onSuggestDamage}
          />
        )}
        <PlayerViewCombatantHeader showPortrait={this.hasImages()} />
        <ul className="combatants">
          {this.props.encounterState.Combatants.map(combatant => (
            <PlayerViewCombatant
              showPortrait={this.showPortrait}
              suggestDamage={this.suggestDamage}
              combatant={combatant}
              areSuggestionsAllowed={this.props.settings.AllowPlayerSuggestions}
              portraitColumnVisible={this.props.settings.DisplayPortraits}
              acColumnVisible={acColumnVisible}
              isActive={
                this.props.encounterState.ActiveCombatantId == combatant.Id
              }
              key={combatant.Id}
            />
          ))}
        </ul>
        {footerVisible && (
          <CombatFooter
            timerVisible={this.props.settings.DisplayTurnTimer}
            currentRound={
              this.props.settings.DisplayRoundCounter
                ? this.props.encounterState.RoundCounter
                : undefined
            }
            activeCombatantId={this.props.encounterState.ActiveCombatantId}
          />
        )}
      </div>
    );
  }

  public componentDidUpdate(prevProps: PlayerViewState) {
    this.splashPortraitIfNeeded(prevProps.encounterState.ActiveCombatantId);
    this.scrollToActiveCombatant();
  }

  private splashPortraitIfNeeded(previousActiveCombatantId) {
    if (!this.props.settings.SplashPortraits) {
      return;
    }

    const newCombatantIsActive =
      previousActiveCombatantId != this.props.encounterState.ActiveCombatantId;

    if (!newCombatantIsActive) {
      return;
    }

    if (this.state.portraitWasRequestedByClick) {
      return;
    }

    const newActiveCombatant = _.find(
      this.props.encounterState.Combatants,
      c => c.Id == this.props.encounterState.ActiveCombatantId
    );

    if (newActiveCombatant && newActiveCombatant.ImageURL.length) {
      this.setState({
        portraitURL: newActiveCombatant.ImageURL,
        portraitCaption: newActiveCombatant.Name,
        showPortrait: true,
        portraitWasRequestedByClick: false
      });
      this.modalTimeout = window.setTimeout(this.closePortrait, 5000);
    }
  }

  private scrollToActiveCombatant() {
    const activeCombatantElement = document.getElementsByClassName("active")[0];
    if (activeCombatantElement) {
      activeCombatantElement.scrollIntoView(false);
    }
  }

  private showPortrait = (combatant: PlayerViewCombatantState) => {
    if (!combatant.ImageURL) {
      return;
    }

    window.clearTimeout(this.modalTimeout);
    this.setState({
      portraitURL: combatant.ImageURL,
      portraitCaption: combatant.Name,
      showPortrait: true,
      portraitWasRequestedByClick: true
    });
  };

  private closePortrait = () => {
    this.setState({
      showPortrait: false,
      portraitWasRequestedByClick: false
    });
  };

  private hasImages = () => {
    return (
      this.props.settings.DisplayPortraits &&
      this.props.encounterState.Combatants.some(c => c.ImageURL.length > 0)
    );
  };

  private suggestDamage = (combatant: PlayerViewCombatantState) => {
    if (!this.props.settings.AllowPlayerSuggestions) {
      return;
    }
    this.setState({
      suggestDamageCombatant: combatant
    });
  };

  private cancelSuggestion = () => {
    this.setState({
      suggestDamageCombatant: null
    });
  };
}
