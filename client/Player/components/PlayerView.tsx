import * as React from "react";

import _ = require("lodash");
import { CombatStats } from "../../../common/CombatStats";
import { TagState } from "../../../common/CombatantState";
import { PlayerViewCombatantState } from "../../../common/PlayerViewCombatantState";
import { PlayerViewState } from "../../../common/PlayerViewState";
import { CombatFooter } from "./CombatFooter";
import { CombatStatsPopup } from "./CombatStatsPopup";
import { CustomStyles } from "./CustomStyles";
import { ApplyDamageCallback, DamageSuggestor } from "./DamageSuggestor";
import { PlayerViewCombatant } from "./PlayerViewCombatant";
import { PlayerViewCombatantHeader } from "./PlayerViewCombatantHeader";
import { PortraitWithCaption } from "./PortraitModal";
import { ApplyTagCallback, TagSuggestor } from "./TagSuggestor";

interface LocalState {
  showPortrait: boolean;
  showCombatStats: boolean;
  portraitWasRequestedByClick: boolean;
  portraitURL: string;
  portraitCaption: string;

  suggestDamageCombatant: PlayerViewCombatantState;
  suggestTagCombatant: PlayerViewCombatantState;
}

interface OwnProps {
  onSuggestDamage: ApplyDamageCallback;
  onSuggestTag: (combatantId: string, tagState: TagState) => void;
  combatStats?: CombatStats;
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
      showCombatStats: false,
      portraitWasRequestedByClick: false,
      portraitURL: "",
      portraitCaption: "",

      suggestDamageCombatant: null,
      suggestTagCombatant: null
    };
  }

  public render() {
    const footerVisible =
      this.props.settings.DisplayRoundCounter ||
      this.props.settings.DisplayTurnTimer;

    const acColumnVisible = this.props.encounterState.Combatants.some(
      c => c.AC != undefined
    );

    const modalVisible =
      this.state.showPortrait ||
      this.state.suggestDamageCombatant ||
      this.state.suggestTagCombatant ||
      this.state.showCombatStats;

    const combatantsById = _.keyBy(
      this.props.encounterState.Combatants,
      c => c.Id
    );
    const combatantNamesById = _.mapValues(combatantsById, c => c.Name);

    return (
      <div className="c-player-view">
        <CustomStyles
          CustomCSS={this.props.settings.CustomCSS}
          CustomStyles={this.props.settings.CustomStyles}
          TemporaryBackgroundImageUrl={
            this.props.encounterState.BackgroundImageUrl
          }
        />
        {modalVisible && (
          <div className="modal-blur" onClick={this.closeAllModals} />
        )}
        {this.state.showPortrait && (
          <PortraitWithCaption
            imageURL={this.state.portraitURL}
            caption={this.state.portraitCaption}
            onClose={this.closeAllModals}
          />
        )}
        {this.state.suggestDamageCombatant && (
          <DamageSuggestor
            combatant={this.state.suggestDamageCombatant}
            onApply={this.handleSuggestDamagePrompt}
          />
        )}
        {this.state.suggestTagCombatant && (
          <TagSuggestor
            targetCombatant={this.state.suggestTagCombatant}
            activeCombatantId={this.props.encounterState.ActiveCombatantId}
            combatantNamesById={combatantNamesById}
            onApply={this.handleSuggestTagPrompt}
          />
        )}
        {this.state.showCombatStats && (
          <CombatStatsPopup stats={this.props.combatStats} />
        )}
        <PlayerViewCombatantHeader
          portraitColumnVisible={this.hasImages()}
          acColumnVisible={acColumnVisible}
        />
        <ul className="combatants">
          {this.props.encounterState.Combatants.map(combatant => (
            <PlayerViewCombatant
              showPortrait={this.showPortrait}
              suggestDamage={this.openSuggestDamagePrompt}
              suggestTag={
                this.props.settings.AllowTagSuggestions &&
                this.openSuggestTagPrompt
              }
              combatant={combatant}
              areSuggestionsAllowed={this.props.settings.AllowPlayerSuggestions}
              portraitColumnVisible={this.hasImages()}
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
    this.showCombatStatsIfNeeded(prevProps.combatStats);
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
      this.modalTimeout = window.setTimeout(this.closeAllModals, 5000);
    }
  }

  private showCombatStatsIfNeeded(prevStats: CombatStats) {
    if (!this.props.combatStats) {
      return;
    }

    if (this.props.combatStats != prevStats) {
      this.setState({
        showCombatStats: true
      });
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

  private closeAllModals = () => {
    this.setState({
      showPortrait: false,
      showCombatStats: false,
      portraitWasRequestedByClick: false,
      suggestDamageCombatant: null,
      suggestTagCombatant: null
    });
  };

  private hasImages = () => {
    return (
      this.props.settings.DisplayPortraits &&
      this.props.encounterState.Combatants.some(c => c.ImageURL.length > 0)
    );
  };

  private openSuggestDamagePrompt = (combatant: PlayerViewCombatantState) => {
    if (!this.props.settings.AllowPlayerSuggestions) {
      return;
    }
    this.setState({
      suggestDamageCombatant: combatant
    });
  };

  private openSuggestTagPrompt = (combatant: PlayerViewCombatantState) => {
    if (!this.props.settings.AllowTagSuggestions) {
      return;
    }
    this.setState({
      suggestTagCombatant: combatant
    });
  };

  private handleSuggestDamagePrompt: ApplyDamageCallback = (
    combatantId,
    damageAmount
  ) => {
    this.closeAllModals();
    if (isNaN(damageAmount) || !damageAmount) {
      return;
    }
    this.props.onSuggestDamage(combatantId, damageAmount);
  };

  private handleSuggestTagPrompt: ApplyTagCallback = tagState => {
    const combatantId = this.state.suggestTagCombatant.Id;
    this.closeAllModals();
    if (tagState.Text.length == 0) {
      return;
    }
    this.props.onSuggestTag(combatantId, tagState);
  };
}
