import { Formik, FormikProps } from "formik";
import _ = require("lodash");
import * as React from "react";
import { AccountClient } from "../../Account/AccountClient";
import { Command } from "../../Commands/Command";
import { Tabs } from "../../Components/Tabs";
import { Libraries } from "../../Library/Libraries";
import { Settings } from "../Settings";
import { About } from "./About";
import { AccountSettings } from "./AccountSettings";
import { CommandsSettings } from "./CommandsSettings";
import { EpicInitiativeSettings } from "./EpicInitiativeSettings";
import { OptionsSettings } from "./OptionsSettings";

enum SettingsTab {
  About = "About",
  Commands = "Commands",
  Options = "Options",
  Account = "Account",
  EpicInitiative = "Epic Initiative"
}

const SettingsTabOptions = _.values<typeof SettingsTab>(SettingsTab);

interface SettingsPaneProps {
  repeatTutorial: () => void;
  reviewPrivacyPolicy: () => void;
  encounterCommands: Command[];
  combatantCommands: Command[];
  accountClient: AccountClient;
  libraries: Libraries;
  settings: Settings;
  handleNewSettings: (newSettings: Settings) => void;
  saveAndClose: () => void;
}
interface SettingsPaneState {
  currentTab: SettingsTab;
}

let lastTab: SettingsTab = SettingsTab.About;

export class SettingsPane extends React.Component<
  SettingsPaneProps,
  SettingsPaneState
> {
  constructor(props) {
    super(props);
    this.state = {
      currentTab: lastTab
    };
  }

  public componentDidUpdate = () => {
    lastTab = this.state.currentTab;
  };

  public render() {
    return (
      <Formik
        initialValues={this.props.settings}
        onSubmit={this.handleFormSubmit}
        render={(props: FormikProps<Settings>) => (
          <form className="settings" onSubmit={props.handleSubmit}>
            <Tabs
              selected={this.state.currentTab}
              options={SettingsTabOptions}
              onChoose={tab => this.setState({ currentTab: tab })}
            />
            {this.getActiveTabContent(props)}
            <button type="submit" className="c-button save-and-close">
              Save and Close
            </button>
          </form>
        )}
      />
    );
  }

  private getActiveTabContent = (formikProps: FormikProps<Settings>) => {
    if (this.state.currentTab == SettingsTab.About) {
      return (
        <About
          repeatTutorial={this.props.repeatTutorial}
          reviewPrivacyPolicy={this.props.reviewPrivacyPolicy}
        />
      );
    }
    if (this.state.currentTab == SettingsTab.Commands) {
      return (
        <CommandsSettings
          commandSettings={formikProps.values.Commands}
          encounterCommands={this.props.encounterCommands}
          combatantCommands={this.props.combatantCommands}
        />
      );
    }
    if (this.state.currentTab == SettingsTab.Options) {
      return (
        <OptionsSettings
          goToEpicInitiativeSettings={() =>
            this.setState({ currentTab: SettingsTab.EpicInitiative })
          }
        />
      );
    }
    if (this.state.currentTab == SettingsTab.Account) {
      return (
        <AccountSettings
          accountClient={this.props.accountClient}
          libraries={this.props.libraries}
        />
      );
    }
    if (this.state.currentTab == SettingsTab.EpicInitiative) {
      return (
        <EpicInitiativeSettings
          playerViewSettings={this.props.settings.PlayerView}
        />
      );
    }
  };

  private handleFormSubmit = (newSettings: Settings) => {
    this.props.handleNewSettings(newSettings);
    this.props.saveAndClose();
  };
}
