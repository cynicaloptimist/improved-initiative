import * as React from "react";

import { AccountClient } from "../../Account/AccountClient";
import { Libraries } from "../../Library/Libraries";
import { AccountSyncSettings } from "./AccountSyncSettings";
import { LocalDataSettings } from "./LocalDataSettings";

interface AccountSettingsProps {
  libraries: Libraries;
  accountClient: AccountClient;
}

export class AccountSettings extends React.Component<AccountSettingsProps> {
  public render() {
    return (
      <React.Fragment>
        <LocalDataSettings />
        <AccountSyncSettings
          accountClient={this.props.accountClient}
          libraries={this.props.libraries}
        />
      </React.Fragment>
    );
  }
}
