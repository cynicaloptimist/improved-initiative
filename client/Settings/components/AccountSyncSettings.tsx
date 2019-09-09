import { saveAs } from "browser-filesaver";
import { forIn } from "lodash";
import * as React from "react";

import { Listable } from "../../../common/Listable";
import { AccountClient } from "../../Account/AccountClient";
import { Button } from "../../Components/Button";
import { UpdateLegacySavedEncounter } from "../../Encounter/UpdateLegacySavedEncounter";
import { env } from "../../Environment";
import { Libraries } from "../../Library/Libraries";
import { Listing } from "../../Library/Listing";
import { LegacySynchronousLocalStore } from "../../Utility/LegacySynchronousLocalStore";

interface AccountSyncSettingsProps {
  libraries: Libraries;
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
        <div className="sync-counts">
          {this.syncCount(
            "Statblocks",
            this.getCounts(this.props.libraries.NPCs.GetStatBlocks())
          )}
          {this.syncCount(
            "Characters",
            this.getCounts(
              this.props.libraries.PersistentCharacters.GetListings()
            )
          )}
          {this.syncCount(
            "Spells",
            this.getCounts(this.props.libraries.Spells.GetSpells())
          )}
          {this.syncCount(
            "Encounters",
            this.getCounts(this.props.libraries.Encounters.Encounters())
          )}
        </div>
        <div className="c-button-with-label">
          <span>Backup and sync local data</span>
          <Button fontAwesomeIcon="cloud-upload-alt" onClick={this.syncAll} />
        </div>
        {this.state.syncError && <pre>{this.state.syncError}</pre>}
        <div className="c-button-with-label">
          <span>Download all synced data to local data</span>
          <Button
            fontAwesomeIcon="cloud-download-alt"
            onClick={this.downloadAndSaveAllSyncedItems}
          />
        </div>
        <div className="c-button-with-label">
          <span>Delete all synced account data</span>
          <Button fontAwesomeIcon="trash" onClick={this.deleteAccount} />
        </div>
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
          {"You're logged in with Patreon, but you have not selected the "}
          <a
            href="https://www.patreon.com/bePatron?c=716070&rid=1322253"
            target="_blank"
          >
            Account Sync
          </a>
          {" reward level."}
        </p>
        <a className="button logout" href="/logout">
          Log Out
        </a>
      </React.Fragment>
    );
  }

  private syncCount = (libraryName: string, syncCount: string) => (
    <span className="sync-counts__row">
      <span className="sync-counts__library-name">{libraryName}</span>
      <span className="sync-counts__count">{syncCount}</span>
    </span>
  );

  private syncAll = () => {
    this.setState({ syncError: "" });
    let blob = LegacySynchronousLocalStore.ExportAll();
    saveAs(blob, "improved-initiative.json");
    this.props.accountClient.SaveAllUnsyncedItems(
      this.props.libraries,
      progressMessage => {
        this.setState({
          syncError:
            this.state.syncError + "\n" + JSON.stringify(progressMessage)
        });
      }
    );
  };

  private downloadAndSaveAllSyncedItems = async () => {
    const libraries = this.props.libraries;
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

    forIn(account.encounters, downloadedEncounter => {
      const encounter = UpdateLegacySavedEncounter(downloadedEncounter);
      libraries.Encounters.Save(encounter);
    });

    location.reload();
  };

  private deleteAccount = async () => {
    const promptText =
      "To delete all of the user data synced to your account, enter DELETE.";
    if (prompt(promptText) == "DELETE") {
      await this.props.accountClient.DeleteAccount();
      location.href = env.BaseUrl;
    }
  };

  private getCounts<T extends Listable>(items: Listing<T>[]) {
    const localAsyncCount = items.filter(c => c.Origin === "localAsync").length;
    const localStorageCount = items.filter(c => c.Origin === "localStorage")
      .length;
    const accountCount = items.filter(c => c.Origin === "account").length;
    return `${localAsyncCount} localAsync, ${localStorageCount} localStorage, ${accountCount} synced`;
  }
}
