import { Formik, FormikProps } from "formik";
import * as _ from "lodash";

import * as React from "react";
import { Settings } from "../../../common/Settings";
import { AccountClient } from "../../Account/AccountClient";
import { Command } from "../../Commands/Command";
import { Tabs } from "../../Components/Tabs";
import { Libraries } from "../../Library/Libraries";
import { About } from "./About";
import { AccountSettings } from "./AccountSettings";
import { CommandsSettings } from "./CommandsSettings";
import { EpicInitiativeSettings } from "./EpicInitiativeSettings";
import { OptionsSettings } from "./OptionsSettings";
import { useContext, useState, useCallback } from "react";
import { SettingsContext } from "../SettingsContext";
import { ContentSettings } from "./ContentSettings";

const SettingsTab = {
  About: "About",
  Commands: "Commands",
  Options: "Options",
  Content: "Content",
  Account: "Account",
  EpicTier: "Epic Tier"
};

interface SettingsPaneProps {
  repeatTutorial: () => void;
  reviewPrivacyPolicy: () => void;
  encounterCommands: Command[];
  combatantCommands: Command[];
  accountClient: AccountClient;
  libraries: Libraries;
  handleNewSettings: (newSettings: Settings) => void;
  closeSettings: () => void;
}

export function SettingsPane(props: SettingsPaneProps) {
  const settings = useContext(SettingsContext);
  const handleFormSubmit = useCallback(
    (newSettings: Settings) => {
      props.handleNewSettings(newSettings);
      props.closeSettings();
    },
    [props.handleNewSettings, props.closeSettings]
  );

  const [currentTab, setCurrentTab] = useState(SettingsTab.About);

  const getTabContent = () => {
    if (currentTab == SettingsTab.About) {
      return (
        <About
          repeatTutorial={props.repeatTutorial}
          reviewPrivacyPolicy={props.reviewPrivacyPolicy}
        />
      );
    }
    if (currentTab == SettingsTab.Commands) {
      return (
        <CommandsSettings
          encounterCommands={props.encounterCommands}
          combatantCommands={props.combatantCommands}
        />
      );
    }
    if (currentTab == SettingsTab.Options) {
      return (
        <OptionsSettings
          goToEpicInitiativeSettings={() =>
            setCurrentTab(SettingsTab.EpicTier)
          }
        />
      );
    }
    if (currentTab == SettingsTab.Content) {
      return <ContentSettings />;
    }
    if (currentTab == SettingsTab.Account) {
      return (
        <AccountSettings
          accountClient={props.accountClient}
          libraries={props.libraries}
        />
      );
    }
    if (currentTab == SettingsTab.EpicTier) {
      return <EpicInitiativeSettings />;
    }
  };

  return (
    <Formik initialValues={settings} onSubmit={handleFormSubmit}>
      {(props: FormikProps<Settings>) => (
        <form className="settings" onSubmit={props.handleSubmit}>
          <Tabs
            selected={currentTab}
            optionNamesById={SettingsTab}
            onChoose={tab => setCurrentTab(SettingsTab[tab])}
          />
          {getTabContent()}
          <button type="submit" className="c-button save-and-close">
            Save and Close
          </button>
        </form>
      )}
    </Formik>
  );
}
