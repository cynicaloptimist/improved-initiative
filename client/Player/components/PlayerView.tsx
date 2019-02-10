import * as React from "react";

import _ = require("lodash");
import { PlayerViewCombatantState } from "../../../common/PlayerViewCombatantState";
import { PlayerViewState } from "../../../common/PlayerViewState";
import { CustomStyles } from "./CustomStyles";
import { DamageSuggestor } from "./DamageSuggestor";
import { PlayerViewCombatant } from "./PlayerViewCombatant";
import { PlayerViewCombatantHeader } from "./PlayerViewCombatantHeader";
import { PortraitModal } from "./PortraitModal";

interface LocalState {
  showPortrait: boolean;
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
      portraitURL: "",
      portraitCaption: "",

      suggestDamageCombatant: null
    };
  }

  public render() {
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
              isPortraitVisible={this.props.settings.DisplayPortraits}
              isActive={
                this.props.encounterState.ActiveCombatantId == combatant.Id
              }
              key={combatant.Id}
            />
          ))}
        </ul>
      </div>
    );
  }

  public componentDidUpdate(prevProps: PlayerViewState) {
    this.handleSplashPortrait(prevProps.encounterState.ActiveCombatantId);
    this.scrollToActiveCombatant();
  }

  private handleSplashPortrait(newActiveCombatantId) {
    if (!this.props.settings.SplashPortraits) {
      return;
    }

    const newCombatantIsActive =
      newActiveCombatantId != this.props.encounterState.ActiveCombatantId;

    if (!newCombatantIsActive) {
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
        showPortrait: true
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
      showPortrait: true
    });
  };

  private closePortrait = () => {
    this.setState({
      showPortrait: false
    });
  };

  private hasImages = () => {
    return (
      this.props.settings.DisplayPortraits &&
      this.props.encounterState.Combatants.some(c => c.ImageURL.length > 0)
    );
  };

  private suggestDamage = (combatant: PlayerViewCombatantState) => {
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
