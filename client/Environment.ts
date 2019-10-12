import * as Sentry from "@sentry/browser";
import { ClientEnvironment } from "../common/ClientEnvironment";

export const env: ClientEnvironment = {
  EncounterId: null,
  PostedEncounter: null,
  ImportedCompressedStatBlockJSON: null,
  HasStorage: false,
  HasEpicInitiative: false,
  IsLoggedIn: false,
  BaseUrl: null,
  PatreonLoginUrl: "http://www.patreon.com/",
  SentryDSN: null
};

export function LoadEnvironment() {
  const html = document.getElementsByTagName("html")[0];

  const environmentJSON = html.getAttribute("environmentJSON");
  Object.assign(env, JSON.parse(environmentJSON));

  const urlParams = new URLSearchParams(window.location.search);
  const compressedStatBlockJSON = urlParams.get("s");
  if (compressedStatBlockJSON) {
    env.ImportedCompressedStatBlockJSON = compressedStatBlockJSON;
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  if (env.SentryDSN !== null) {
    Sentry.init({
      dsn: env.SentryDSN,
      release: `improved-initiative@${process.env.VERSION}`
    });
  }
}
