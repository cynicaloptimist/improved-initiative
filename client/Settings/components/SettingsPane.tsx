import _ = require("lodash");
import * as React from "react";
import { Tabs } from "../../Components/Tabs";

enum SettingsTab {
  About = "About",
  Commands = "Commands",
  Options = "Options",
  Account = "Account",
  EpicInitiative = "Epic Initiative"
}

const SettingsTabOptions = _.values<typeof SettingsTab>(SettingsTab);

interface SettingsPaneProps {}
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
      <Tabs
        selected={this.state.currentTab}
        options={SettingsTabOptions}
        onChoose={tab => this.setState({ currentTab: tab })}
      />
    );
  }
}
