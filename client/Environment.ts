import * as Sentry from "@sentry/browser";
import { ParseJSONOrDefault } from "../common/Toolbox";

interface Environment {
  EncounterId: string;
  PostedEncounter: { Combatants: {}[] } | null;
  ImportedCompressedStatBlockJSON: string | null;
  IsLoggedIn: boolean;
  HasStorage: boolean;
  HasEpicInitiative: boolean;
  BaseUrl: string;
  PatreonLoginUrl: string;
}

export const env: Environment = {
  EncounterId: null,
  BaseUrl: null,
  PostedEncounter: null,
  ImportedCompressedStatBlockJSON: null,
  HasStorage: false,
  HasEpicInitiative: false,
  IsLoggedIn: false,
  PatreonLoginUrl: "http://www.patreon.com/"
};

export function LoadEnvironment() {
  const html = document.getElementsByTagName("html")[0];

  env.EncounterId = html.getAttribute("encounterId");
  env.BaseUrl = html.getAttribute("baseUrl");

  const encounterJSON = html.getAttribute("postedEncounter");
  if (encounterJSON) {
    env.PostedEncounter = ParseJSONOrDefault(encounterJSON, null);
  }

  const urlParams = new URLSearchParams(window.location.search);
  const compressedStatBlockJSON = urlParams.get("s");
  if (compressedStatBlockJSON) {
    env.ImportedCompressedStatBlockJSON = compressedStatBlockJSON;
  }

  env.HasStorage = html.getAttribute("hasStorage") == "true";
  env.HasEpicInitiative = html.getAttribute("hasEpicInitiative") == "true";
  env.IsLoggedIn = html.getAttribute("isLoggedIn") == "true";
  env.PatreonLoginUrl = html.getAttribute("patreonLoginUrl");

  const sentryDsn = html.getAttribute("sentryDsn");
  if (sentryDsn !== null) {
    Sentry.init({
      dsn: sentryDsn,
      release: `improved-initiative@${process.env.VERSION}`
    });
  }
}
