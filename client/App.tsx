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
import { VerticalResizer } from "./Layout/VerticalResizer";
import { useStoreBackedState } from "./Utility/useStoreBackedState";
import { Store } from "./Utility/Store";
import { LegacySynchronousLocalStore } from "./Utility/LegacySynchronousLocalStore";
import { DndProvider } from "react-dnd";
import {
  centerColumnView,
  interfacePriorityClass,
  CenterColumn
} from "./Layout/CenterColumn";
import { ToolbarHost } from "./Layout/ToolbarHost";
import { LeftColumn } from "./Layout/LeftColumn";
import { RightColumn } from "./Layout/RightColumn";

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
  const statblockEditorProps = useSubscription(tracker.StatBlockEditorProps);
  const spellEditorProps = useSubscription(tracker.SpellEditorProps);
  const prompts = useSubscription(tracker.PromptQueue.GetPrompts);

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

  const blurVisible = tutorialVisible || settingsVisible;

  return (
    <DndProvider backend={HTML5Backend}>
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
            <ThreeColumnLayout tracker={tracker} />
          </div>
        </TextEnricherContext.Provider>
      </SettingsContext.Provider>
    </DndProvider>
  );
}

function ThreeColumnLayout(props: { tracker: TrackerViewModel }) {
  const [columnWidth, setColumnWidth] = useStoreBackedState(
    Store.User,
    "columnWidth",
    375
  );

  return (
    <>
      <ToolbarHost tracker={props.tracker} />
      <LeftColumn tracker={props.tracker} columnWidth={columnWidth} />

      <VerticalResizer
        adjustWidth={offset => setColumnWidth(columnWidth + offset)}
      />
      <CenterColumn tracker={props.tracker} />
      <VerticalResizer
        adjustWidth={offset => setColumnWidth(columnWidth - offset)}
      />
      <RightColumn tracker={props.tracker} columnWidth={columnWidth} />
    </>
  );
}
