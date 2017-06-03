import * as appInsights from "applicationinsights";

interface Window {
    appInsights: Client;
}

export const getClient = (): Client => window["appInsights"];