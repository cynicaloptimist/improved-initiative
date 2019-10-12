import * as Sentry from "@sentry/browser";
import { ClientEnvironment } from "../common/ClientEnvironment";

export const env: ClientEnvironment = {
  EncounterId: null,
  PostedEncounter: null,
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

  if (env.SentryDSN !== null) {
    Sentry.init({
      dsn: env.SentryDSN,
      release: `improved-initiative@${process.env.VERSION}`
    });
  }
}
