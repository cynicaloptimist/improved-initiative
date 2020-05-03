import * as ko from "knockout";
import * as React from "react";

import { TagState } from "../../common/CombatantState";
import { probablyUniqueString } from "../../common/Toolbox";
import { Combatant } from "../Combatant/Combatant";
import { CombatantDetails } from "../Combatant/CombatantDetails";
import { CombatantViewModel } from "../Combatant/CombatantViewModel";
import { MultipleCombatantDetails } from "../Combatant/MultipleCombatantDetails";
import { Dice } from "../Rules/Dice";
import { RollResult } from "../Rules/RollResult";
import { CurrentSettings } from "../Settings/Settings";
import { TrackerViewModel } from "../TrackerViewModel";
import { Metrics } from "../Utility/Metrics";
import { BuildCombatantCommandList } from "./BuildCombatantCommandList";
import { Command } from "./Command";
import { AcceptDamagePrompt } from "../Prompts/AcceptDamagePrompt";
import { AcceptTagPrompt } from "../Prompts/AcceptTagPrompt";
import { ApplyDamagePrompt } from "../Prompts/ApplyDamagePrompt";
import { ApplyHealingPrompt } from "../Prompts/ApplyHealingPrompt";
import { ConcentrationPrompt } from "../Prompts/ConcentrationPrompt";
import { ShowDiceRollPrompt } from "../Prompts/RollDicePrompt";
import { TagPrompt } from "../Prompts/TagPrompt";
import { UpdateNotesPrompt } from "../Prompts/UpdateNotesPrompt";
import { ApplyTemporaryHPPrompt } from "../Prompts/ApplyTemporaryHPPrompt";
import { LinkInitiativePrompt } from "../Prompts/LinkInitiativePrompt";
import { TextEnricherContext } from "../TextEnricher/TextEnricher";

interface PendingLinkInitiative {
  combatant: CombatantViewModel;
  promptId: string;
}

export class CombatantCommander {
  private selectedCombatantIds = ko.observableArray<string>([]);
  private latestRoll: RollResult;

  constructor(private tracker: TrackerViewModel) {
    this.Commands = BuildCombatantCommandList(this);
  }

  public Commands: Command[];
  public SelectedCombatants = ko.pureComputed<CombatantViewModel[]>(() => {
    const selectedCombatantIds = this.selectedCombatantIds();
    return this.tracker
      .CombatantViewModels()
      .filter(c => selectedCombatantIds.some(id => c.Combatant.Id == id));
  });
  public HasSelected = ko.pureComputed(
    () => this.SelectedCombatants().length > 0
  );
  public HasOneSelected = ko.pureComputed(
    () => this.SelectedCombatants().length === 1
  );
  public HasMultipleSelected = ko.pureComputed(
    () => this.SelectedCombatants().length > 1
  );

  public CombatantDetails = ko.pureComputed(() => {
    const selectedCombatants = this.SelectedCombatants();
    if (selectedCombatants.length == 0) {
      return null;
    }

    if (selectedCombatants.length == 1) {
      const combatantViewModel = selectedCombatants[0];
      return (
        <TextEnricherContext.Provider
          value={this.tracker.StatBlockTextEnricher}
        >
          <CombatantDetails
            combatantViewModel={combatantViewModel}
            displayMode="default"
          />
        </TextEnricherContext.Provider>
      );
    }

    return (
      <TextEnricherContext.Provider value={this.tracker.StatBlockTextEnricher}>
        <MultipleCombatantDetails combatants={selectedCombatants} />
      </TextEnricherContext.Provider>
    );
  });

  public Select = (data: CombatantViewModel, appendSelection?: boolean) => {
    if (!data) {
      return;
    }
    const pendingLink = this.pendingLinkInitiative();
    if (pendingLink) {
      this.linkCombatantInitiatives([data, pendingLink.combatant]);
      this.tracker.PromptQueue.Remove(pendingLink.promptId);
    }
    if (!appendSelection) {
      this.selectedCombatantIds.removeAll();
    }
    this.selectedCombatantIds.push(data.Combatant.Id);
    Metrics.TrackEvent("CombatantsSelected", {
      Count: this.selectedCombatantIds().length
    });
  };

  private selectByOffset = (offset: number) => {
    let newIndex =
      this.tracker.CombatantViewModels().indexOf(this.SelectedCombatants()[0]) +
      offset;
    if (newIndex < 0) {
      newIndex = 0;
    } else if (newIndex >= this.tracker.CombatantViewModels().length) {
      newIndex = this.tracker.CombatantViewModels().length - 1;
    }
    this.selectedCombatantIds.removeAll();
    this.selectedCombatantIds.push(
      this.tracker.CombatantViewModels()[newIndex].Combatant.Id
    );
  };

  public Remove = () => {
    if (!this.HasSelected()) {
      return;
    }

    const combatantsToRemove = this.SelectedCombatants();
    this.selectedCombatantIds.removeAll();
    const firstDeletedIndex = this.tracker
      .CombatantViewModels()
      .indexOf(combatantsToRemove[0]);
    const deletedCombatantNames = combatantsToRemove.map(
      c => c.Combatant.StatBlock().Name
    );

    if (this.tracker.CombatantViewModels().length > combatantsToRemove.length) {
      let activeCombatant = this.tracker.Encounter.EncounterFlow.ActiveCombatant();
      while (combatantsToRemove.some(c => c.Combatant === activeCombatant)) {
        this.tracker.Encounter.EncounterFlow.NextTurn(
          this.tracker.EncounterCommander.RerollInitiative
        );
        activeCombatant = this.tracker.Encounter.EncounterFlow.ActiveCombatant();
      }
    }

    combatantsToRemove.forEach(vm =>
      this.tracker.Encounter.RemoveCombatant(vm.Combatant)
    );

    const remainingCombatants = this.tracker.CombatantViewModels();
    if (remainingCombatants.length > 0) {
      const newSelectionIndex =
        firstDeletedIndex > remainingCombatants.length
          ? remainingCombatants.length - 1
          : firstDeletedIndex;
      this.Select(this.tracker.CombatantViewModels()[newSelectionIndex]);
    }

    this.tracker.EventLog.AddEvent(
      `${deletedCombatantNames.join(", ")} removed from encounter.`
    );
    Metrics.TrackEvent("CombatantsRemoved", { Names: deletedCombatantNames });
  };

  public Deselect = () => {
    this.selectedCombatantIds([]);
  };

  public SelectPrevious = () => {
    if (this.tracker.CombatantViewModels().length == 0) {
      return;
    }

    if (!this.HasSelected()) {
      this.Select(this.tracker.CombatantViewModels()[0]);
      return;
    }

    this.selectByOffset(-1);
  };

  public SelectNext = () => {
    if (this.tracker.CombatantViewModels().length == 0) {
      return;
    }

    if (!this.HasSelected()) {
      this.Select(this.tracker.CombatantViewModels()[0]);
      return;
    }

    this.selectByOffset(1);
  };

  private editHPForCombatants(combatantViewModels: CombatantViewModel[]) {
    const latestRollTotal = this.latestRoll?.Total || 0;
    const prompt = ApplyDamagePrompt(
      combatantViewModels,
      latestRollTotal.toString(),
      this.tracker.EventLog.LogHPChange
    );
    this.tracker.PromptQueue.Add(prompt);
  }

  public EditHP = () => {
    if (!this.HasSelected()) {
      return;
    }

    const selectedCombatants = this.SelectedCombatants();
    this.editHPForCombatants(selectedCombatants);
  };

  public EditSingleCombatantHP = (combatantViewModel: CombatantViewModel) => {
    this.editHPForCombatants([combatantViewModel]);
  };

  public ApplyHealing = () => {
    if (!this.HasSelected()) {
      return;
    }
    const selectedCombatants = this.SelectedCombatants();
    const latestRollTotal = this.latestRoll?.Total || 0;
    const prompt = ApplyHealingPrompt(
      selectedCombatants,
      latestRollTotal.toString(),
      this.tracker.EventLog.LogHPChange
    );
    this.tracker.PromptQueue.Add(prompt);
  };

  public UpdateNotes = async () => {
    if (!this.HasOneSelected()) {
      return;
    }

    const combatant = this.SelectedCombatants()[0].Combatant;
    this.tracker.PromptQueue.Add(UpdateNotesPrompt(combatant));
    return false;
  };

  public PromptAcceptSuggestedDamage = (
    suggestedCombatants: CombatantViewModel[],
    suggestedDamage: number,
    suggester: string
  ) => {
    const allowPlayerSuggestions = CurrentSettings().PlayerView
      .AllowPlayerSuggestions;

    if (!allowPlayerSuggestions) {
      return false;
    }

    Metrics.TrackEvent("DamageSuggested", { Amount: suggestedDamage });

    const prompt = AcceptDamagePrompt(
      suggestedCombatants,
      suggestedDamage,
      suggester,
      this.tracker
    );

    this.tracker.PromptQueue.Add(prompt);
    return false;
  };

  public PromptAcceptSuggestedTag = (
    suggestedCombatant: Combatant,
    suggestedTag: TagState
  ) => {
    const prompt = AcceptTagPrompt(
      suggestedCombatant,
      this.tracker.Encounter,
      suggestedTag
    );

    this.tracker.PromptQueue.Add(prompt);
    return false;
  };

  public CheckConcentration = (combatant: Combatant, damageAmount: number) => {
    setTimeout(() => {
      const prompt = ConcentrationPrompt(combatant, damageAmount);
      this.tracker.PromptQueue.Add(prompt);
      Metrics.TrackEvent("ConcentrationCheckTriggered");
    }, 1);
  };

  public AddTemporaryHP = () => {
    if (!this.HasSelected()) {
      return;
    }

    const selectedCombatants = this.SelectedCombatants();
    const combatantNames = selectedCombatants.map(c => c.Name()).join(", ");
    const prompt = ApplyTemporaryHPPrompt(combatantNames, model => {
      if (model.hpAmount) {
        selectedCombatants.forEach(c => c.ApplyTemporaryHP(model.hpAmount));
        this.tracker.EventLog.AddEvent(
          `${model.hpAmount} temporary hit points granted to ${combatantNames}.`
        );
        Metrics.TrackEvent("TemporaryHPAdded", { Amount: model.hpAmount });
      }
      return true;
    });

    this.tracker.PromptQueue.Add(prompt);

    return false;
  };

  public AddTag = (combatantVM?: CombatantViewModel) => {
    let targetCombatants: Combatant[] = [];

    if (combatantVM instanceof CombatantViewModel) {
      targetCombatants = [combatantVM.Combatant];
    } else {
      targetCombatants = this.SelectedCombatants().map(c => c.Combatant);
    }

    if (targetCombatants.length == 0) {
      return;
    }

    const prompt = TagPrompt(
      this.tracker.Encounter,
      targetCombatants,
      this.tracker.EventLog.AddEvent
    );
    this.tracker.PromptQueue.Add(prompt);
    return false;
  };

  public EditInitiative = () => {
    this.SelectedCombatants().forEach(c => c.EditInitiative());
    return false;
  };

  private pendingLinkInitiative = ko.observable<PendingLinkInitiative>(null);

  private linkCombatantInitiatives = (combatants: CombatantViewModel[]) => {
    this.pendingLinkInitiative(null);
    const highestInitiative = combatants
      .map(c => c.Combatant.Initiative())
      .sort((a, b) => b - a)[0];
    const initiativeGroup = probablyUniqueString();

    combatants.forEach(s => {
      s.Combatant.Initiative(highestInitiative);
      s.Combatant.InitiativeGroup(initiativeGroup);
    });
    this.tracker.Encounter.CleanInitiativeGroups();

    this.tracker.Encounter.SortByInitiative();
    Metrics.TrackEvent("InitiativeLinked");
  };

  public LinkInitiative = () => {
    if (!this.HasSelected()) {
      return;
    }

    const selected = this.SelectedCombatants();

    if (selected.length == 1) {
      const prompt = LinkInitiativePrompt(() =>
        this.pendingLinkInitiative(null)
      );
      const promptId = this.tracker.PromptQueue.Add(prompt);
      this.pendingLinkInitiative({ combatant: selected[0], promptId });
      return;
    }

    this.linkCombatantInitiatives(selected);
  };

  public MoveUp = () => {
    if (!this.HasSelected()) {
      return;
    }

    const combatant = this.SelectedCombatants()[0];
    const index = this.tracker.CombatantViewModels().indexOf(combatant);
    if (combatant && index > 0) {
      const newInitiative = this.tracker.Encounter.MoveCombatant(
        combatant.Combatant,
        index - 1
      );
      this.tracker.EventLog.AddEvent(
        `${combatant.Name()} initiative set to ${newInitiative}.`
      );
    }
  };

  public MoveDown = () => {
    if (!this.HasSelected()) {
      return;
    }

    const combatant = this.SelectedCombatants()[0];
    const index = this.tracker.CombatantViewModels().indexOf(combatant);
    if (combatant && index < this.tracker.CombatantViewModels().length - 1) {
      const newInitiative = this.tracker.Encounter.MoveCombatant(
        combatant.Combatant,
        index + 1
      );
      this.tracker.EventLog.AddEvent(
        `${combatant.Name()} initiative set to ${newInitiative}.`
      );
    }
  };

  public SetAlias = () => {
    if (!this.HasSelected()) {
      return;
    }

    this.SelectedCombatants().forEach(c => c.SetAlias());
    return false;
  };

  public ToggleHidden = () => {
    if (!this.HasSelected()) {
      return;
    }

    this.SelectedCombatants().forEach(c => c.ToggleHidden());
  };

  public ToggleRevealedAC = () => {
    if (!this.HasSelected()) {
      return;
    }

    this.SelectedCombatants().forEach(c => c.ToggleRevealedAC());
  };

  public EditOwnStatBlock = () => {
    if (!this.HasSelected()) {
      return;
    }

    if (this.SelectedCombatants().length == 1) {
      const selectedCombatant = this.SelectedCombatants()[0].Combatant;
      if (selectedCombatant.PersistentCharacterId) {
        this.tracker.EditPersistentCharacterStatBlock(
          selectedCombatant.PersistentCharacterId
        );
      } else {
        this.tracker.EditStatBlock({
          editorTarget: "combatant",
          statBlock: selectedCombatant.StatBlock(),
          onSave: newStatBlock => {
            selectedCombatant.StatBlock(newStatBlock);
          },
          onDelete: () => this.Remove()
        });
      }
    }
  };

  public RollDice = (diceExpression: string) => {
    const diceRoll = Dice.RollDiceExpression(diceExpression);
    this.latestRoll = diceRoll;
    const prompt = ShowDiceRollPrompt(diceExpression, diceRoll);

    Metrics.TrackEvent("DiceRolled", {
      Expression: diceExpression,
      Result: diceRoll.FormattedString
    });
    this.tracker.PromptQueue.Add(prompt);
  };
}
