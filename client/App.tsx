import * as React from "react";
import { TrackerViewModel } from "./TrackerViewModel";
import { useSubscription } from "./Combatant/linkComponentToObservables";
import { CurrentSettings } from "./Settings/Settings";
import { SettingsContext } from "./Settings/SettingsContext";
import { SettingsPane } from "./Settings/components/SettingsPane";
import { AccountClient } from "./Account/AccountClient";
import { Tutorial } from "./Tutorial/Tutorial";
import { env } from "./Environment";
import { Command } from "./Commands/Command";
import { Toolbar } from "./Commands/Toolbar";
import { LibraryPanes } from "./Library/Components/LibraryPanes";
import { find } from "lodash";
import { CombatantDetails } from "./Combatant/CombatantDetails";
import { TextEnricherContext } from "./TextEnricher/TextEnricher";
import {
  StatBlockEditor,
  StatBlockEditorProps
} from "./StatBlockEditor/StatBlockEditor";
import { SpellEditor, SpellEditorProps } from "./StatBlockEditor/SpellEditor";
import { InitiativeList } from "./InitiativeList/InitiativeList";
import { CommandContext } from "./InitiativeList/CommandContext";
import { useCallback } from "react";
import { TagState } from "../common/CombatantState";
import { PendingPrompts } from "./Prompts/PendingPrompts";
import { CombatFooter } from "./CombatFooter/CombatFooter";
import { SelectedCombatants } from "./SelectedCombatants";
import { VerticalResizer } from "./VerticalResizer";
import { useStoreBackedState } from "./Utility/useStoreBackedState";
import { Store } from "./Utility/Store";

/*
 * This file is new as of 05/2020. Most of the logic was extracted from TrackerViewModel.
 * TrackerViewModel was the top level Knockout viewmodel for binding to ko components.
 */

export function App(props: { tracker: TrackerViewModel }) {
  const { tracker } = props;
  const settings = useSubscription(CurrentSettings);

  const settingsVisible = useSubscription(tracker.SettingsVisible);
  const tutorialVisible = useSubscription(tracker.TutorialVisible);
  const librariesVisible = useSubscription(tracker.LibrariesVisible);
  const combatantViewModels = useSubscription(tracker.CombatantViewModels);
  const statblockEditorProps = useSubscription(tracker.StatBlockEditorProps);
  const spellEditorProps = useSubscription(tracker.SpellEditorProps);
  const prompts = useSubscription(tracker.PromptQueue.GetPrompts);

  const activeCombatant = useSubscription(
    tracker.Encounter.EncounterFlow.ActiveCombatant
  );
  const encounterFlowState = useSubscription(
    tracker.Encounter.EncounterFlow.State
  );

  const isACombatantSelected = useSubscription(
    tracker.CombatantCommander.HasSelected
  );

  const centerColumn = centerColumnView(statblockEditorProps, spellEditorProps);
  const interfacePriority = interfacePriorityClass(
    centerColumn,
    librariesVisible,
    prompts.length > 0,
    isACombatantSelected,
    encounterFlowState
  );

  const activeCombatantViewModel = find(
    combatantViewModels,
    c => c.Combatant == activeCombatant
  );

  const blurVisible = tutorialVisible || settingsVisible;

  const [columnWidth, setColumnWidth] = useStoreBackedState(
    Store.User,
    "columnWidth",
    375
  );

  const droppableCallback = useCallback(
    (e: React.DragEvent<any>) => e.preventDefault(),
    []
  );
  const droppableProps: React.HTMLProps<any> = {
    onDragEnter: droppableCallback,
    onDragOver: droppableCallback
  };

  return (
    <SettingsContext.Provider value={settings}>
      <TextEnricherContext.Provider value={tracker.StatBlockTextEnricher}>
        <div className={"encounter-view " + interfacePriority}>
          {blurVisible && (
            <div className="modal-blur" onClick={tracker.CloseSettings} />
          )}
          {settingsVisible && (
            <SettingsPane
              handleNewSettings={tracker.SaveUpdatedSettings}
              encounterCommands={tracker.EncounterToolbar}
              combatantCommands={tracker.CombatantCommander.Commands}
              reviewPrivacyPolicy={tracker.ReviewPrivacyPolicy}
              repeatTutorial={tracker.RepeatTutorial}
              closeSettings={() => tracker.SettingsVisible(false)}
              libraries={tracker.Libraries}
              accountClient={new AccountClient()}
            />
          )}
          {tutorialVisible && (
            <Tutorial onClose={() => tracker.TutorialVisible(false)} />
          )}
          {!env.IsLoggedIn && (
            <a className="login button" href={env.PatreonLoginUrl}>
              Log In with Patreon
            </a>
          )}
          <ToolbarHost tracker={tracker} />
          <div
            className="left-column"
            style={{ width: columnWidth, maxWidth: columnWidth }}
            {...droppableProps}
          >
            {librariesVisible && (
              <LibraryPanes
                librariesCommander={tracker.LibrariesCommander}
                libraries={tracker.Libraries}
                statBlockTextEnricher={tracker.StatBlockTextEnricher}
              />
            )}
            {librariesVisible || (
              <div className="active-combatant">
                <div className="combatant-details__header">
                  <h2>Active Combatant</h2>
                </div>
                {activeCombatantViewModel && (
                  <CombatantDetails
                    combatantViewModel={activeCombatantViewModel}
                    displayMode="active"
                    key={activeCombatantViewModel.Combatant.Id}
                  />
                )}
                {!activeCombatant && (
                  <p className="start-encounter-hint">
                    Click [<span className="fas fa-play" /> Start Encounter ] to
                    roll initiative. The StatBlock for the Active Combatant will
                    be displayed here.
                  </p>
                )}
              </div>
            )}
          </div>
          <VerticalResizer
            adjustWidth={offset => setColumnWidth(columnWidth + offset)}
          />
          <div className="center-column" {...droppableProps}>
            {centerColumn === "statblockeditor" && (
              <StatBlockEditor {...statblockEditorProps} />
            )}
            {centerColumn === "spelleditor" && (
              <SpellEditor {...spellEditorProps} />
            )}
            {centerColumn === "combat" && (
              <>
                <InitiativeListHost tracker={tracker} />
                <PendingPrompts
                  promptsAndIds={prompts}
                  removePrompt={tracker.PromptQueue.Remove}
                />
              </>
            )}
            <CombatFooter
              encounter={tracker.Encounter}
              eventLog={tracker.EventLog}
            />
          </div>
          <VerticalResizer
            adjustWidth={offset =>
              setColumnWidth(columnWidth - offset)
            }
          />
          <div
            className="right-column"
            style={{ width: columnWidth, maxWidth: columnWidth }}
            {...droppableProps}
          >
            <SelectedCombatants
              combatantCommander={tracker.CombatantCommander}
            />
          </div>
        </div>
      </TextEnricherContext.Provider>
    </SettingsContext.Provider>
  );
}

function centerColumnView(
  statBlockEditorProps: StatBlockEditorProps,
  spellEditorProps: SpellEditorProps
) {
  if (statBlockEditorProps !== null) {
    return "statblockeditor";
  }
  if (spellEditorProps !== null) {
    return "spelleditor";
  }
  return "combat";
}

function interfacePriorityClass(
  centerColumnView: string,
  librariesVisible: boolean,
  hasPrompt: boolean,
  isACombatantSelected: boolean,
  encounterState: "active" | "inactive"
) {
  if (
    centerColumnView === "statblockeditor" ||
    centerColumnView === "spelleditor"
  ) {
    if (librariesVisible) {
      return "show-center-left-right";
    }
    return "show-center-right-left";
  }

  if (librariesVisible) {
    return "show-left-center-right";
  }

  if (hasPrompt) {
    if (isACombatantSelected) {
      return "show-center-right-left";
    }
    return "show-center-left-right";
  }

  if (isACombatantSelected) {
    return "show-right-center-left";
  }

  if (encounterState == "active") {
    return "show-center-left-right";
  }

  return "show-center-right-left";
}

function ToolbarHost(props: { tracker: TrackerViewModel }) {
  const { tracker } = props;
  const encounterState = useSubscription(tracker.Encounter.EncounterFlow.State);
  const combatantSelected = useSubscription(
    tracker.CombatantCommander.HasSelected
  );
  const oneCombatantSelected = useSubscription(
    tracker.CombatantCommander.HasOneSelected
  );
  const toolbarWide = useSubscription(tracker.ToolbarWide);

  const commandsToHideById =
    encounterState === "active"
      ? ["start-encounter"]
      : ["reroll-initiative", "end-encounter", "next-turn", "previous-turn"];

  if (!oneCombatantSelected) {
    commandsToHideById.push("update-notes");
  }

  const shouldShowCommand = (c: Command) =>
    !commandsToHideById.some(d => c.Id == d);

  return (
    <Toolbar
      encounterCommands={tracker.EncounterToolbar.filter(shouldShowCommand)}
      combatantCommands={tracker.CombatantCommander.Commands.filter(
        shouldShowCommand
      )}
      width={toolbarWide ? "wide" : "narrow"}
      showCombatantCommands={combatantSelected}
    />
  );
}

function InitiativeListHost(props: { tracker: TrackerViewModel }) {
  const { tracker } = props;

  const encounterState = useSubscription(
    tracker.Encounter.ObservableEncounterState
  );
  const selectedCombatantIds = useSubscription(
    tracker.CombatantCommander.SelectedCombatants
  ).map(c => c.Combatant.Id);
  const combatantCountsByName = useSubscription(
    tracker.Encounter.CombatantCountsByName
  );
  const combatantViewModels = useSubscription(tracker.CombatantViewModels);

  const selectCombatantById = useCallback(
    (combatantId: string, appendSelection: boolean) => {
      const selectedViewModel = combatantViewModels.find(
        c => c.Combatant.Id == combatantId
      );

      if (selectedViewModel !== undefined) {
        tracker.CombatantCommander.Select(selectedViewModel, appendSelection);
      }
    },
    [tracker, combatantViewModels]
  );

  const removeCombatantTag = useCallback(
    (combatantId: string, tagState: TagState) => {
      const combatantViewModel = combatantViewModels.find(
        c => c.Combatant.Id == combatantId
      );
      combatantViewModel?.RemoveTagByState(tagState);
    },
    [tracker, combatantViewModels]
  );

  const applyDamageToCombatant = useCallback(
    (combatantId: string) => {
      const combatantViewModel = combatantViewModels.find(
        c => c.Combatant.Id == combatantId
      );

      if (combatantViewModel !== undefined) {
        tracker.CombatantCommander.EditSingleCombatantHP(combatantViewModel);
      }
    },
    [tracker, combatantViewModels]
  );

  return (
    <CommandContext.Provider
      value={{
        SelectCombatant: selectCombatantById,
        RemoveTagFromCombatant: removeCombatantTag,
        ApplyDamageToCombatant: applyDamageToCombatant,
        CombatantCommands: tracker.CombatantCommander.Commands
      }}
    >
      <InitiativeList
        encounterState={encounterState}
        selectedCombatantIds={selectedCombatantIds}
        combatantCountsByName={combatantCountsByName}
      />
    </CommandContext.Provider>
  );
}
