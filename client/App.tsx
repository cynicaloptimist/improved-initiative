import * as React from "react";
import { HTML5Backend } from "react-dnd-html5-backend";

import { TrackerViewModel } from "./TrackerViewModel";
import { useSubscription } from "./Combatant/linkComponentToObservables";
import { CurrentSettings } from "./Settings/Settings";
import { SettingsContext } from "./Settings/SettingsContext";
import { SettingsPane } from "./Settings/components/SettingsPane";
import { AccountClient } from "./Account/AccountClient";
import { Tutorial } from "./Tutorial/Tutorial";
import { env } from "./Environment";
import { TextEnricherContext } from "./TextEnricher/TextEnricher";
import { LegacySynchronousLocalStore } from "./Utility/LegacySynchronousLocalStore";
import { DndProvider } from "react-dnd";
import { interfacePriorityClass } from "./Layout/interfacePriorityClass";
import { centerColumnView } from "./Layout/centerColumnView";
import { ThreeColumnLayout } from "./Layout/ThreeColumnLayout";
import { LibraryManager } from "./Library/Manager/LibraryManager";
import { LibrariesContext, useLibraries } from "./Library/Libraries";
import { Store } from "./Utility/Store";

/*
 * This file is new as of 05/2020. Most of the logic was extracted from TrackerViewModel.
 * TrackerViewModel was the top level Knockout viewmodel for binding to ko components.
 */

export function App(props: { tracker: TrackerViewModel }): JSX.Element {
  const { tracker } = props;
  const settings = useSubscription(CurrentSettings);

  const settingsVisible = useSubscription(tracker.SettingsVisible);
  const tutorialVisible = useSubscription(tracker.TutorialVisible);
  const libraryManagerActive = useSubscription(tracker.LibraryManagerActive);
  const librariesVisible = useSubscription(tracker.LibrariesVisible);
  const statblockEditorProps = useSubscription(tracker.StatBlockEditorProps);
  const spellEditorProps = useSubscription(tracker.SpellEditorProps);
  const prompts = useSubscription(tracker.PromptQueue.GetPrompts);

  const encounterFlowState = useSubscription(
    tracker.Encounter.EncounterFlow.State
  );

  const isACombatantSelected = useSubscription(
    tracker.CombatantCommander.HasSelected
  );

  const libraries = useLibraries(new AccountClient(), storeName => {
    if (storeName === Store.PersistentCharacters) {
      tracker.LoadAutoSavedEncounterIfAvailable();
    }
  });

  tracker.SetLibraries(libraries);

  const centerColumn = centerColumnView(statblockEditorProps, spellEditorProps);
  const interfacePriority = interfacePriorityClass(
    centerColumn,
    librariesVisible,
    prompts.length > 0,
    isACombatantSelected,
    encounterFlowState
  );

  const blurVisible = tutorialVisible || settingsVisible;

  return (
    <DndProvider backend={HTML5Backend}>
      <SettingsContext.Provider value={settings}>
        <TextEnricherContext.Provider value={tracker.StatBlockTextEnricher}>
          <LibrariesContext.Provider value={libraries}>
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
                  libraries={libraries}
                  accountClient={new AccountClient()}
                />
              )}
              {tutorialVisible && (
                <Tutorial
                  onClose={() => {
                    tracker.TutorialVisible(false);
                    LegacySynchronousLocalStore.Save(
                      LegacySynchronousLocalStore.User,
                      "SkipIntro",
                      true
                    );
                  }}
                />
              )}
              {!env.IsLoggedIn && (
                <a className="login button" href={env.PatreonLoginUrl}>
                  Log In with Patreon
                </a>
              )}
              {libraryManagerActive ? (
                <LibraryManager
                  libraries={libraries}
                  librariesCommander={tracker.LibrariesCommander}
                  statBlockTextEnricher={tracker.StatBlockTextEnricher}
                  closeManager={() => tracker.LibraryManagerActive(false)}
                />
              ) : (
                <ThreeColumnLayout tracker={tracker} />
              )}
            </div>
          </LibrariesContext.Provider>
        </TextEnricherContext.Provider>
      </SettingsContext.Provider>
    </DndProvider>
  );
}
