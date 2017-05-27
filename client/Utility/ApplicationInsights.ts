interface Window {
    appInsights: Client;
}

export const getClient = (): Client => window["appInsights"];