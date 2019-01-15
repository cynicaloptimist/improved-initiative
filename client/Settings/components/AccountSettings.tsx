import * as React from "react";

import { AccountClient } from "../../Account/AccountClient";
import { AccountViewModel } from "../AccountViewModel";
import { AccountSyncSettings } from "./AccountSyncSettings";
import { LocalDataSettings } from "./LocalDataSettings";

interface AccountSettingsProps {
  accountViewModel: AccountViewModel;
  accountClient: AccountClient;
}

export class AccountSettings extends React.Component<AccountSettingsProps> {
  public render() {
    return (
      <React.Fragment>
        <LocalDataSettings />
        <AccountSyncSettings
          accountClient={this.props.accountClient}
          accountViewModel={this.props.accountViewModel}
        />
      </React.Fragment>
    );
  }
}
