import * as Sentry from "@sentry/browser";
import { ClientEnvironment } from "../common/ClientEnvironment";

export const env: ClientEnvironment = {
  EncounterId: "",
  PostedEncounter: null,
  HasStorage: false,
  HasEpicInitiative: false,
  HasMythic: false,
  IsLoggedIn: false,
  SendMetrics: false,
  BaseUrl: "",
  PatreonLoginUrl: "http://www.patreon.com/",
  GoogleAnalyticsId: "",
  SentryDSN: null
};

export function LoadEnvironment() {
  const html = document.getElementsByTagName("html")[0];

  const environmentJSON = html.getAttribute("environmentJSON");
  Object.assign(env, JSON.parse(environmentJSON || "{}"));

  if (env.SentryDSN !== null) {
    Sentry.init({
      dsn: env.SentryDSN,
      release: `improved-initiative@${process.env.VERSION}`,
      ignoreErrors: ["TypeError: Failed to fetch"]
    });
  }
}
