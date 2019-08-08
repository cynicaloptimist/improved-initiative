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
import { AcceptDamagePrompt } from "./Prompts/AcceptDamagePrompt";
import { AcceptTagPrompt } from "./Prompts/AcceptTagPrompt";
import { ConcentrationPrompt } from "./Prompts/ConcentrationPrompt";
import { DefaultPrompt } from "./Prompts/Prompt";
import { ShowDiceRollPrompt } from "./Prompts/RollDicePrompt";
import { TagPrompt } from "./Prompts/TagPrompt";
import { UpdateNotesPrompt } from "./Prompts/UpdateNotesPrompt";
import { ApplyDamagePrompt } from "./Prompts/components/ApplyDamagePrompt";
import { ApplyHealingPrompt } from "./Prompts/components/ApplyHealingPrompt";

interface PendingLinkInitiative {
  combatant: CombatantViewModel;
  prompt: DefaultPrompt;
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
      .OrderedCombatants()
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
      return React.createElement(CombatantDetails, {
        combatantViewModel,
        enricher: this.tracker.StatBlockTextEnricher,
        displayMode: "default"
      });
    }

    return React.createElement(MultipleCombatantDetails, {
      combatants: selectedCombatants,
      enricher: this.tracker.StatBlockTextEnricher
    });
  });

  public Select = (data: CombatantViewModel, e?: MouseEvent) => {
    if (!data) {
      return;
    }
    const pendingLink = this.pendingLinkInitiative();
    if (pendingLink) {
      this.linkCombatantInitiatives([data, pendingLink.combatant]);
      pendingLink.prompt.Resolve(null);
    }
    if (!((e && e.ctrlKey) || (e && e.metaKey))) {
      this.selectedCombatantIds.removeAll();
    }
    this.selectedCombatantIds.push(data.Combatant.Id);
    Metrics.TrackEvent("CombatantsSelected", {
      Count: this.selectedCombatantIds().length
    });
  };

  private selectByOffset = (offset: number) => {
    let newIndex =
      this.tracker.OrderedCombatants().indexOf(this.SelectedCombatants()[0]) +
      offset;
    if (newIndex < 0) {
      newIndex = 0;
    } else if (newIndex >= this.tracker.OrderedCombatants().length) {
      newIndex = this.tracker.OrderedCombatants().length - 1;
    }
    this.selectedCombatantIds.removeAll();
    this.selectedCombatantIds.push(
      this.tracker.OrderedCombatants()[newIndex].Combatant.Id
    );
  };

  public Remove = () => {
    if (!this.HasSelected()) {
      return;
    }

    const combatantsToRemove = this.SelectedCombatants();
    this.selectedCombatantIds.removeAll();
    const firstDeletedIndex = this.tracker
      .OrderedCombatants()
      .indexOf(combatantsToRemove[0]);
    const deletedCombatantNames = combatantsToRemove.map(
      c => c.Combatant.StatBlock().Name
    );

    if (this.tracker.OrderedCombatants().length > combatantsToRemove.length) {
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

    const remainingCombatants = this.tracker.OrderedCombatants();
    if (remainingCombatants.length > 0) {
      const newSelectionIndex =
        firstDeletedIndex > remainingCombatants.length
          ? remainingCombatants.length - 1
          : firstDeletedIndex;
      this.Select(this.tracker.OrderedCombatants()[newSelectionIndex]);
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
    if (this.tracker.OrderedCombatants().length == 0) {
      return;
    }

    if (!this.HasSelected()) {
      this.Select(this.tracker.OrderedCombatants()[0]);
      return;
    }

    this.selectByOffset(-1);
  };

  public SelectNext = () => {
    if (this.tracker.OrderedCombatants().length == 0) {
      return;
    }

    if (!this.HasSelected()) {
      this.Select(this.tracker.OrderedCombatants()[0]);
      return;
    }

    this.selectByOffset(1);
  };

  private editHPForCombatants(combatantViewModels: CombatantViewModel[]) {
    const latestRollTotal = (this.latestRoll && this.latestRoll.Total) || 0;
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
    const latestRollTotal = (this.latestRoll && this.latestRoll.Total) || 0;
    const prompt = ApplyHealingPrompt(
      selectedCombatants,
      latestRollTotal.toString(),
      this.tracker.EventLog.LogHPChange
    );
    this.tracker.PromptQueue.Add(prompt);
  };

  public UpdateNotes = async () => {
    if (!this.HasSelected()) {
      return;
    }

    const selectedCombatants = this.SelectedCombatants().filter(
      c => c.Combatant.PersistentCharacterId != null
    );
    if (selectedCombatants.length == 0) {
      throw "Can't edit non-persistent combatant notes";
    }
    const combatant = selectedCombatants[0].Combatant;

    this.tracker.PromptQueue.AddLegacyPrompt(new UpdateNotesPrompt(combatant));
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

    const prompt = new AcceptDamagePrompt(
      suggestedCombatants,
      suggestedDamage,
      suggester,
      this.tracker
    );

    this.tracker.PromptQueue.AddLegacyPrompt(prompt);
    return false;
  };

  public PromptAcceptSuggestedTag = (
    suggestedCombatant: Combatant,
    suggestedTag: TagState,
    suggester: string
  ) => {
    const prompt = new AcceptTagPrompt(
      suggestedCombatant,
      this.tracker.Encounter,
      suggestedTag,
      suggester
    );

    this.tracker.PromptQueue.AddLegacyPrompt(prompt);
    return false;
  };

  public CheckConcentration = (combatant: Combatant, damageAmount: number) => {
    setTimeout(() => {
      const prompt = new ConcentrationPrompt(combatant, damageAmount);
      this.tracker.PromptQueue.AddLegacyPrompt(prompt);
      Metrics.TrackEvent("ConcentrationCheckTriggered");
    }, 1);
  };

  public AddTemporaryHP = () => {
    if (!this.HasSelected()) {
      return;
    }

    const selectedCombatants = this.SelectedCombatants();
    const combatantNames = selectedCombatants.map(c => c.Name()).join(", ");
    const prompt = new DefaultPrompt(
      `Grant temporary hit points to ${combatantNames}: <input id='thp' class='response' type='number' />`,
      response => {
        const thp = response["thp"];
        if (thp) {
          selectedCombatants.forEach(c => c.ApplyTemporaryHP(thp));
          this.tracker.EventLog.AddEvent(
            `${thp} temporary hit points granted to ${combatantNames}.`
          );
          Metrics.TrackEvent("TemporaryHPAdded", { Amount: thp });
        }
      }
    );
    this.tracker.PromptQueue.AddLegacyPrompt(prompt);

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

    if (selected.length <= 1) {
      const message = `<p>Select another combatant to link initiative. <br /><em>Tip:</em> You can select multiple combatants with 'ctrl', then use this command to link them to one shared initiative count.</p>`;
      const prompt = new DefaultPrompt(message, _ =>
        this.pendingLinkInitiative(null)
      );
      this.tracker.PromptQueue.AddLegacyPrompt(prompt);
      this.pendingLinkInitiative({ combatant: selected[0], prompt: prompt });
      return;
    }

    this.linkCombatantInitiatives(selected);
  };

  public MoveUp = () => {
    if (!this.HasSelected()) {
      return;
    }

    const combatant = this.SelectedCombatants()[0];
    const index = this.tracker.OrderedCombatants().indexOf(combatant);
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
    const index = this.tracker.OrderedCombatants().indexOf(combatant);
    if (combatant && index < this.tracker.OrderedCombatants().length - 1) {
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
      let selectedCombatant = this.SelectedCombatants()[0].Combatant;
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
