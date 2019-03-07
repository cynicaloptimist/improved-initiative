import { Formik } from "formik";
import _ = require("lodash");
import * as React from "react";
import { Tabs } from "../../Components/Tabs";
import { About } from "./About";

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
        initialValues={{}}
        onSubmit={() => {}}
        render={props => (
          <form onSubmit={props.handleSubmit}>
            <Tabs
              selected={this.state.currentTab}
              options={SettingsTabOptions}
              onChoose={tab => this.setState({ currentTab: tab })}
            />
            {this.getActiveTabContent()}
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
  };
}
