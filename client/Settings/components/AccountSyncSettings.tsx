import { saveAs } from "browser-filesaver";
import { forIn } from "lodash";
import * as React from "react";

import { CombatantState } from "../../../common/CombatantState";
import { EncounterState } from "../../../common/EncounterState";
import { PersistentCharacter } from "../../../common/PersistentCharacter";
import { Spell } from "../../../common/Spell";
import { StatBlock } from "../../../common/StatBlock";
import { AccountClient } from "../../Account/AccountClient";
import { Button } from "../../Components/Button";
import { env } from "../../Environment";
import { Store } from "../../Utility/Store";
import { AccountViewModel } from "../AccountViewModel";

interface AccountSyncSettingsProps {
  accountViewModel: AccountViewModel;
  accountClient: AccountClient;
}

interface AccountSyncSettingsState {
  syncError: string;
}

export class AccountSyncSettings extends React.Component<
  AccountSyncSettingsProps,
  AccountSyncSettingsState
> {
  constructor(props) {
    super(props);
    this.state = {
      syncError: ""
    };
  }
  public render() {
    if (!env.IsLoggedIn) {
      return this.loginMessage();
    }

    if (!env.HasStorage) {
      return this.noSyncMessage();
    }

    return (
      <React.Fragment>
        <h3>Account Sync</h3>
        <p>Account Sync is enabled.</p>
        <ul>
          <li>Creatures: {this.props.accountViewModel.SyncedCreatures()}</li>
          <li>Characters: {this.props.accountViewModel.SyncedCharacters()}</li>
          <li>Spells: {this.props.accountViewModel.SyncedSpells()}</li>
          <li>Encounters: {this.props.accountViewModel.SyncedEncounters()}</li>
        </ul>
        <p>
          <Button fontAwesomeIcon="cloud-upload-alt" onClick={this.syncAll} />
          Backup and sync local data
        </p>
        <p>
          <Button
            fontAwesomeIcon="cloud-download-alt"
            onClick={this.downloadAndSaveAllSyncedItems}
          />
          Download all synced data to local data
        </p>
        <p>
          <Button fontAwesomeIcon="trash" onClick={this.deleteAccount} />
          Delete all synced account data
        </p>
        {this.state.syncError && <pre>{this.state.syncError}</pre>}
        <a className="button logout" href="/logout">
          Log Out
        </a>
      </React.Fragment>
    );
  }

  private loginMessage() {
    return (
      <React.Fragment>
        <p>
          Log in with Patreon to access patron benefits. Account Sync allows you
          to access your custom statblocks and encounters from anywhere!
        </p>
        <a className="login button" href={env.PatreonLoginUrl}>
          Log In with Patreon
        </a>
      </React.Fragment>
    );
  }

  private noSyncMessage() {
    return (
      <React.Fragment>
        <p>
          You're logged in with Patreon, but you have not selected the
          <a
            href="https://www.patreon.com/bePatron?c=716070&rid=1322253"
            target="_blank"
          >
            Account Sync
          </a>
          reward level.
        </p>
        <a className="button logout" href="/logout">
          Log Out
        </a>
      </React.Fragment>
    );
  }

  private syncAll = () => {
    this.setState({ syncError: "" });
    let blob = Store.ExportAll();
    saveAs(blob, "improved-initiative.json");
    this.props.accountClient.SaveAll(
      this.props.accountViewModel.Libraries,
      progressMessage => {
        this.setState({
          syncError:
            this.state.syncError + "\n" + JSON.stringify(progressMessage)
        });
      }
    );
  };

  private downloadAndSaveAllSyncedItems = async () => {
    const libraries = this.props.accountViewModel.Libraries;
    const account = await this.props.accountClient.GetFullAccount();

    forIn(account.statblocks, statBlock =>
      libraries.NPCs.SaveNewStatBlock(statBlock)
    );

    forIn(account.persistentcharacters, persistentCharacter => {
      libraries.PersistentCharacters.AddNewPersistentCharacter(
        persistentCharacter
      );
    });

    forIn(account.spells, spell => libraries.Spells.AddOrUpdateSpell(spell));

    forIn(account.encounters, encounter => {
      libraries.Encounters.Save(encounter);
    });
  };

  private deleteAccount = async () => {
    const promptText =
      "To delete all of the user data synced to your account, enter DELETE.";
    if (prompt(promptText) == "DELETE") {
      await this.props.accountClient.DeleteAccount();
      location.href = env.CanonicalURL;
    }
  };
}
