import * as ko from "knockout";
import { find, max, sortBy } from "lodash";
import * as React from "react";

import { CombatantState } from "../../common/CombatantState";
import { EncounterState } from "../../common/EncounterState";
import { PersistentCharacter } from "../../common/PersistentCharacter";
import { PlayerViewCombatantState } from "../../common/PlayerViewCombatantState";
import { AutoRerollInitiativeOption } from "../../common/Settings";
import { StatBlock } from "../../common/StatBlock";
import { probablyUniqueString } from "../../common/Toolbox";
import { AccountClient } from "../Account/AccountClient";
import { Combatant } from "../Combatant/Combatant";
import { GetOrRollMaximumHP } from "../Combatant/GetOrRollMaximumHP";
import { Tag } from "../Combatant/Tag";
import { ToPlayerViewCombatantState } from "../Combatant/ToPlayerViewCombatantState";
import { env } from "../Environment";
import {
  PersistentCharacterLibrary,
  PersistentCharacterUpdater
} from "../Library/PersistentCharacterLibrary";
import { PlayerViewClient } from "../Player/PlayerViewClient";
import { IRules } from "../Rules/Rules";
import { CurrentSettings } from "../Settings/Settings";
import { Store } from "../Utility/Store";
import {
  DifficultyCalculator,
  EncounterDifficulty
} from "../Widgets/DifficultyCalculator";
import { TurnTimer } from "../Widgets/TurnTimer";

export class Encounter {
  private lastVisibleActiveCombatantId = null;

  constructor(
    private playerViewClient: PlayerViewClient,
    private promptEditCombatantInitiative: (combatantId: string) => void,
    public Rules: IRules
  ) {
    this.CombatantCountsByName = ko.observable({});
    this.ActiveCombatant = ko.observable<Combatant>();
    this.Difficulty = ko.pureComputed(() => {
      const enemyChallengeRatings = this.combatants()
        .filter(c => !c.IsPlayerCharacter)
        .filter(c => c.StatBlock().Challenge)
        .map(c => c.StatBlock().Challenge.toString());
      const playerLevels = this.combatants()
        .filter(c => c.IsPlayerCharacter)
        .filter(c => c.StatBlock().Challenge)
        .map(c => c.StatBlock().Challenge.toString());
      return DifficultyCalculator.Calculate(
        enemyChallengeRatings,
        playerLevels
      );
    });
  }

  public TurnTimer = new TurnTimer();
  private combatants = ko.observableArray<Combatant>([]);
  public Combatants = ko.pureComputed(() => this.combatants());
  public CombatantCountsByName: KnockoutObservable<{ [name: string]: number }>;
  public ActiveCombatant: KnockoutObservable<Combatant>;
  public ActiveCombatantStatBlock: KnockoutComputed<React.ReactElement<any>>;
  public Difficulty: KnockoutComputed<EncounterDifficulty>;

  public State: KnockoutObservable<"active" | "inactive"> = ko.observable<
    "active" | "inactive"
  >("inactive");
  public StateIcon = ko.pureComputed(() =>
    this.State() === "active" ? "fa-play" : "fa-pause"
  );
  public StateTip = ko.pureComputed(() =>
    this.State() === "active" ? "Encounter Active" : "Encounter Inactive"
  );

  public RoundCounter: KnockoutObservable<number> = ko.observable(0);
  public EncounterId = env.EncounterId;

  private getGroupBonusForCombatant(combatant: Combatant) {
    if (combatant.InitiativeGroup() == null) {
      return combatant.InitiativeBonus;
    }

    const groupBonuses = this.combatants()
      .filter(c => c.InitiativeGroup() == combatant.InitiativeGroup())
      .map(c => c.InitiativeBonus);

    return max(groupBonuses) || combatant.InitiativeBonus;
  }

  private getCombatantSortIteratees(
    stable: boolean
  ): ((c: Combatant) => number | string)[] {
    if (stable) {
      return [c => -c.Initiative()];
    } else {
      return [
        c => -c.Initiative(),
        c => -this.getGroupBonusForCombatant(c),
        c => -c.InitiativeBonus,
        c => (c.IsPlayerCharacter ? 0 : 1),
        c => c.InitiativeGroup(),
        c => c.StatBlock().Name,
        c => c.IndexLabel
      ];
    }
  }

  public SortByInitiative = (stable = false) => {
    const sortedCombatants = sortBy(
      this.combatants(),
      this.getCombatantSortIteratees(stable)
    );
    this.combatants(sortedCombatants);
    this.QueueEmitEncounter();
  };

  public ImportEncounter = encounter => {
    const deepMerge = (a, b) => $.extend(true, {}, a, b);
    const defaultAdd = c => {
      if (c.TotalInitiativeModifier !== undefined) {
        c.InitiativeModifier = c.TotalInitiativeModifier;
      }
      this.AddCombatantFromStatBlock(deepMerge(StatBlock.Default(), c));
    };
    if (encounter.Combatants) {
      encounter.Combatants.forEach(c => {
        if (c.Id) {
          $.ajax(`/statblocks/${c.Id}`)
            .done(statBlockFromLibrary => {
              const modifiedStatBlockFromLibrary = deepMerge(
                statBlockFromLibrary,
                c
              );
              this.AddCombatantFromStatBlock(modifiedStatBlockFromLibrary);
            })
            .fail(_ => defaultAdd(c));
        } else {
          defaultAdd(c);
        }
      });
    }
  };

  private emitEncounterTimeoutID;

  private EmitEncounter = () => {
    if (!this.playerViewClient) {
      return;
    }
    this.playerViewClient.UpdateEncounter(
      this.EncounterId,
      this.GetPlayerView()
    );
    Store.Save<EncounterState<CombatantState>>(
      Store.AutoSavedEncounters,
      Store.DefaultSavedEncounterId,
      this.GetEncounterState(this.EncounterId, "")
    );
  };

  public QueueEmitEncounter() {
    clearTimeout(this.emitEncounterTimeoutID);
    this.emitEncounterTimeoutID = setTimeout(this.EmitEncounter, 10);
  }

  public AddCombatantFromState = (combatantState: CombatantState) => {
    if (this.combatants().some(c => c.Id == combatantState.Id)) {
      combatantState.Id = probablyUniqueString();
    }

    const combatant = new Combatant(combatantState, this);
    this.combatants.push(combatant);

    combatant.UpdateIndexLabel();

    if (this.State() === "active") {
      this.promptEditCombatantInitiative(combatant.Id);
    }

    combatant.Tags().forEach(tag => {
      if (tag.HasDuration) {
        this.AddDurationTag(tag);
      }
    });

    return combatant;
  };

  public AddCombatantFromStatBlock = (statBlockJson: {}, hideOnAdd = false) => {
    const statBlock: StatBlock = { ...StatBlock.Default(), ...statBlockJson };

    statBlock.HP = {
      ...statBlock.HP,
      Value: GetOrRollMaximumHP(statBlock)
    };

    const initialState: CombatantState = {
      Id: probablyUniqueString(),
      StatBlock: statBlock,
      Alias: "",
      IndexLabel: null,
      CurrentHP: statBlock.HP.Value,
      TemporaryHP: 0,
      Hidden: hideOnAdd,
      RevealedAC: false,
      Initiative: 0,
      Tags: [],
      InterfaceVersion: process.env.VERSION
    };

    const combatant = this.AddCombatantFromState(initialState);

    this.QueueEmitEncounter();

    return combatant;
  };

  public CanAddCombatant = (persistentCharacterId: string) => {
    return !this.combatants().some(
      c => c.PersistentCharacterId == persistentCharacterId
    );
  };

  public AddCombatantFromPersistentCharacter(
    persistentCharacter: PersistentCharacter,
    library: PersistentCharacterUpdater,
    hideOnAdd = false
  ): Combatant {
    if (!this.CanAddCombatant(persistentCharacter.Id)) {
      return null;
    }

    const initialState: CombatantState = {
      Id: probablyUniqueString(),
      PersistentCharacterId: persistentCharacter.Id,
      StatBlock: persistentCharacter.StatBlock,
      Alias: "",
      IndexLabel: null,
      CurrentHP: persistentCharacter.CurrentHP,
      TemporaryHP: 0,
      Hidden: hideOnAdd,
      RevealedAC: false,
      Initiative: 0,
      Tags: [],
      InterfaceVersion: persistentCharacter.Version
    };

    const combatant = this.AddCombatantFromState(initialState);

    combatant.CurrentNotes(persistentCharacter.Notes);
    combatant.AttachToPersistentCharacterLibrary(library);

    this.QueueEmitEncounter();

    return combatant;
  }

  public RemoveCombatant = (combatant: Combatant) => {
    this.combatants.remove(combatant);

    const removedCombatantName = combatant.StatBlock().Name;
    const remainingCombatants = this.combatants();

    const allMyFriendsAreGone = remainingCombatants.every(
      c => c.StatBlock().Name != removedCombatantName
    );

    if (allMyFriendsAreGone) {
      const combatantCountsByName = this.CombatantCountsByName();
      delete combatantCountsByName[removedCombatantName];
      this.CombatantCountsByName(combatantCountsByName);
    }

    if (this.combatants().length == 0) {
      this.EndEncounter();
    }
  };

  public UpdatePersistentCharacterStatBlock(
    persistentCharacterId: string,
    newStatBlock: StatBlock
  ) {
    const combatant = find(
      this.combatants(),
      c => c.PersistentCharacterId == persistentCharacterId
    );
    if (!combatant) {
      return;
    }
    combatant.StatBlock(newStatBlock);
  }

  public MoveCombatant(combatant: Combatant, index: number) {
    combatant.InitiativeGroup(null);
    this.CleanInitiativeGroups();
    const currentPosition = this.combatants().indexOf(combatant);
    const passedCombatant = this.combatants()[index];
    const initiative = combatant.Initiative();
    let newInitiative = initiative;
    if (
      index > currentPosition &&
      passedCombatant &&
      passedCombatant.Initiative() < initiative
    ) {
      newInitiative = passedCombatant.Initiative();
    }
    if (
      index < currentPosition &&
      passedCombatant &&
      passedCombatant.Initiative() > initiative
    ) {
      newInitiative = passedCombatant.Initiative();
    }

    this.combatants.remove(combatant);
    this.combatants.splice(index, 0, combatant);
    combatant.Initiative(newInitiative);
    combatant.Encounter.QueueEmitEncounter();
    return newInitiative;
  }

  public CleanInitiativeGroups() {
    const combatants = this.combatants();
    combatants.forEach(combatant => {
      const group = combatant.InitiativeGroup();
      if (
        group &&
        combatants.filter(c => c.InitiativeGroup() === group).length < 2
      ) {
        combatant.InitiativeGroup(null);
      }
    });
  }

  public StartEncounter = () => {
    this.SortByInitiative();
    if (this.State() == "inactive") {
      this.RoundCounter(1);
    }
    this.State("active");
    this.ActiveCombatant(this.combatants()[0]);
    this.TurnTimer.Start();
    this.QueueEmitEncounter();
  };

  public EndEncounter = () => {
    this.State("inactive");
    this.RoundCounter(0);
    this.ActiveCombatant(null);
    this.TurnTimer.Stop();
    this.QueueEmitEncounter();
  };

  public NextTurn = (promptRerollInitiative: () => boolean) => {
    const activeCombatant = this.ActiveCombatant();

    this.durationTags
      .filter(
        t =>
          t.HasDuration &&
          t.DurationCombatantId == activeCombatant.Id &&
          t.DurationTiming == "EndOfTurn"
      )
      .forEach(t => t.Decrement());

    let nextIndex = this.combatants().indexOf(activeCombatant) + 1;
    if (nextIndex >= this.combatants().length) {
      nextIndex = 0;

      const autoRerollOption = CurrentSettings().Rules.AutoRerollInitiative;
      if (autoRerollOption == AutoRerollInitiativeOption.Prompt) {
        promptRerollInitiative();
      }
      if (autoRerollOption == AutoRerollInitiativeOption.Automatic) {
        this.rerollInitiativeWithoutPrompt();
      }

      this.RoundCounter(this.RoundCounter() + 1);
    }

    const nextCombatant = this.combatants()[nextIndex];

    this.ActiveCombatant(nextCombatant);

    this.durationTags
      .filter(
        t =>
          t.HasDuration &&
          t.DurationCombatantId == nextCombatant.Id &&
          t.DurationTiming == "StartOfTurn"
      )
      .forEach(t => t.Decrement());

    this.TurnTimer.Reset();
    this.QueueEmitEncounter();
  };

  public PreviousTurn = () => {
    const activeCombatant = this.ActiveCombatant();
    this.durationTags
      .filter(
        t =>
          t.HasDuration &&
          t.DurationCombatantId == activeCombatant.Id &&
          t.DurationTiming == "StartOfTurn"
      )
      .forEach(t => t.Increment());

    let previousIndex = this.combatants().indexOf(activeCombatant) - 1;
    if (previousIndex < 0) {
      previousIndex = this.combatants().length - 1;
      this.RoundCounter(this.RoundCounter() - 1);
    }

    const previousCombatant = this.combatants()[previousIndex];
    this.ActiveCombatant(previousCombatant);

    this.durationTags
      .filter(
        t =>
          t.HasDuration &&
          t.DurationCombatantId == previousCombatant.Id &&
          t.DurationTiming == "EndOfTurn"
      )
      .forEach(t => t.Increment());

    this.QueueEmitEncounter();
  };

  private durationTags: Tag[] = [];

  public AddDurationTag = (tag: Tag) => {
    this.durationTags.push(tag);
  };

  public GetSavedEncounter = (
    name: string,
    path: string
  ): EncounterState<CombatantState> => {
    let activeCombatant = this.ActiveCombatant();
    const id = AccountClient.MakeId(name, path);
    return {
      Name: name,
      Path: path,
      Id: id,
      ActiveCombatantId: activeCombatant ? activeCombatant.Id : null,
      RoundCounter: this.RoundCounter(),
      Combatants: this.combatants()
        .filter(c => c.PersistentCharacterId == null)
        .map<CombatantState>(this.getCombatantState),
      Version: process.env.VERSION
    };
  };

  public GetEncounterState = (
    name: string,
    path: string
  ): EncounterState<CombatantState> => {
    let activeCombatant = this.ActiveCombatant();
    const id = AccountClient.MakeId(name, path);
    return {
      Name: name,
      Path: path,
      Id: id,
      ActiveCombatantId: activeCombatant ? activeCombatant.Id : null,
      RoundCounter: this.RoundCounter(),
      Combatants: this.combatants().map<CombatantState>(this.getCombatantState),
      Version: process.env.VERSION
    };
  };

  public GetPlayerView = (): EncounterState<PlayerViewCombatantState> => {
    const activeCombatantId = this.getPlayerViewActiveCombatantId();
    return {
      Name: this.EncounterId,
      Path: "",
      Id: this.EncounterId,
      ActiveCombatantId: activeCombatantId,
      RoundCounter: this.RoundCounter(),
      Combatants: this.getCombatantsForPlayerView(activeCombatantId),
      Version: process.env.VERSION
    };
  };

  public LoadEncounterState = (
    encounterState: EncounterState<CombatantState>,
    persistentCharacterLibrary: PersistentCharacterLibrary
  ) => {
    const savedEncounterIsActive = !!encounterState.ActiveCombatantId;
    encounterState.Combatants.forEach(async savedCombatant => {
      if (this.combatants().some(c => c.Id == savedCombatant.Id)) {
        savedCombatant.Id = probablyUniqueString();
      }

      const combatant = this.AddCombatantFromState(savedCombatant);

      if (combatant.PersistentCharacterId) {
        const persistentCharacter = await persistentCharacterLibrary.GetPersistentCharacter(
          combatant.PersistentCharacterId
        );
        combatant.StatBlock(persistentCharacter.StatBlock);
        combatant.CurrentHP(persistentCharacter.CurrentHP);
        combatant.CurrentNotes(persistentCharacter.Notes);
        combatant.AttachToPersistentCharacterLibrary(
          persistentCharacterLibrary
        );
      }
    });

    if (savedEncounterIsActive) {
      this.State("active");
      this.ActiveCombatant(
        this.combatants()
          .filter(c => c.Id == encounterState.ActiveCombatantId)
          .pop()
      );
      this.TurnTimer.Start();
    }
    this.RoundCounter(encounterState.RoundCounter || 1);
  };

  public ClearEncounter = () => {
    this.combatants([]);
    this.CombatantCountsByName({});
    this.EndEncounter();
  };

  private getPlayerViewActiveCombatantId() {
    const activeCombatant = this.ActiveCombatant();
    if (!activeCombatant) {
      this.lastVisibleActiveCombatantId = null;
      return this.lastVisibleActiveCombatantId;
    }

    if (activeCombatant.Hidden()) {
      return this.lastVisibleActiveCombatantId;
    }

    this.lastVisibleActiveCombatantId = activeCombatant.Id;

    return this.lastVisibleActiveCombatantId;
  }

  private getCombatantsForPlayerView(activeCombatantId: string) {
    const hideMonstersOutsideEncounter = CurrentSettings().PlayerView
      .HideMonstersOutsideEncounter;
    const combatants = this.combatants().filter(c => {
      if (c.Hidden()) {
        return false;
      }
      if (
        hideMonstersOutsideEncounter &&
        this.State() == "inactive" &&
        !c.IsPlayerCharacter
      ) {
        return false;
      }
      return true;
    });

    const activeCombatantOnTop = CurrentSettings().PlayerView
      .ActiveCombatantOnTop;
    if (activeCombatantOnTop && activeCombatantId) {
      while (combatants[0].Id != activeCombatantId) {
        combatants.push(combatants.shift());
      }
    }

    return combatants.map<PlayerViewCombatantState>(c =>
      ToPlayerViewCombatantState(c)
    );
  }

  private getCombatantState = (c: Combatant): CombatantState => {
    return {
      Id: c.Id,
      PersistentCharacterId: c.PersistentCharacterId,
      StatBlock: c.StatBlock(),
      CurrentHP: c.CurrentHP(),
      TemporaryHP: c.TemporaryHP(),
      Initiative: c.Initiative(),
      InitiativeGroup: c.InitiativeGroup(),
      Alias: c.Alias(),
      IndexLabel: c.IndexLabel,
      Tags: c
        .Tags()
        .filter(t => t.Visible())
        .map(t => ({
          Text: t.Text,
          DurationRemaining: t.DurationRemaining(),
          DurationTiming: t.DurationTiming,
          DurationCombatantId: t.DurationCombatantId
        })),
      Hidden: c.Hidden(),
      RevealedAC: c.RevealedAC(),
      InterfaceVersion: process.env.VERSION
    };
  };

  private rerollInitiativeWithoutPrompt = () => {
    const combatants = this.combatants();
    combatants.forEach(c => c.Initiative(c.GetInitiativeRoll()));
    this.SortByInitiative(false);
  };
}
