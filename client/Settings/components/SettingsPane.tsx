import { Formik } from "formik";
import _ = require("lodash");
import * as React from "react";
import { AccountClient } from "../../Account/AccountClient";
import { Tabs } from "../../Components/Tabs";
import { Libraries } from "../../Library/Libraries";
import { Settings } from "../Settings";
import { About } from "./About";
import { AccountSettings } from "./AccountSettings";
import { EpicInitiativeSettings } from "./EpicInitiativeSettings";

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
  accountClient: AccountClient;
  libraries: Libraries;
  settings: Settings;
  handleNewSettings: (newSettings: Settings) => void;
  saveAndClose: () => void;
}
interface SettingsPaneState {
  currentTab: SettingsTab;
}

export class SettingsPane extends React.Component<
  SettingsPaneProps,
  SettingsPaneState
> {
  constructor(props) {
    super(props);
    this.state = {
      currentTab: SettingsTab.About
    };
  }

  public render() {
    return (
      <Formik
        initialValues={this.props.settings}
        onSubmit={this.handleFormSubmit}
        render={props => (
          <form className="settings" onSubmit={props.handleSubmit}>
            <Tabs
              selected={this.state.currentTab}
              options={SettingsTabOptions}
              onChoose={tab => this.setState({ currentTab: tab })}
            />
            {this.getActiveTabContent()}
            <button type="submit" className="c-button save-and-close">
              Save and Close
            </button>
          </form>
        )}
      />
    );
  }

  private getActiveTabContent = () => {
    if (this.state.currentTab == SettingsTab.About) {
      return (
        <About
          repeatTutorial={this.props.repeatTutorial}
          reviewPrivacyPolicy={this.props.reviewPrivacyPolicy}
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
