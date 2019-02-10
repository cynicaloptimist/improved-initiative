import * as React from "react";

import _ = require("lodash");
import { PlayerViewState } from "../../../common/PlayerViewState";
import { CustomStyles } from "./CustomStyles";
import { PlayerViewCombatant } from "./PlayerViewCombatant";
import { PlayerViewCombatantHeader } from "./PlayerViewCombatantHeader";

interface PortraitModalProps {
  imageURL: string;
  caption: string;
  onClose: () => void;
}
class PortraitModal extends React.Component<PortraitModalProps> {
  public render() {
    return (
      <div
        className="modal-blur combatant-portrait"
        onClick={this.props.onClose}
      >
        <img className="combatant-portrait__image" src={this.props.imageURL} />
        <div className="combatant-portrait__caption">{this.props.caption}</div>
      </div>
    );
  }
}

interface LocalState {
  showModal: boolean;
  modalURL: string;
  modalCaption: string;
}

export class PlayerView extends React.Component<PlayerViewState, LocalState> {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      modalURL: "",
      modalCaption: ""
    };
  }

  public render() {
    return (
      <div className="c-player-view">
        <CustomStyles
          CustomCSS={this.props.settings.CustomCSS}
          CustomStyles={this.props.settings.CustomStyles}
        />
        {this.state.showModal && (
          <PortraitModal
            imageURL={this.state.modalURL}
            caption={this.state.modalCaption}
            onClose={this.closeModal}
          />
        )}
        <PlayerViewCombatantHeader showPortrait={this.hasImages()} />
        <ul className="combatants">
          {this.props.encounterState.Combatants.map(combatant => (
            <PlayerViewCombatant
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

    if (newActiveCombatant && newActiveCombatant.ImageURL.length)
      this.setState({
        modalURL: newActiveCombatant.ImageURL,
        modalCaption: newActiveCombatant.Name,
        showModal: true
      });
  }

  private closeModal = () => {
    this.setState({
      showModal: false
    });
  };

  private hasImages = () => {
    return (
      this.props.settings.DisplayPortraits &&
      this.props.encounterState.Combatants.some(c => c.ImageURL.length > 0)
    );
  };
}
