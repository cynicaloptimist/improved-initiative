interface Environment {
    EncounterId: string;
    PostedEncounter: { Combatants: any[] };
    IsLoggedIn: boolean;
    HasStorage: boolean;
    HasEpicInitiative: boolean;
    PatreonLoginUrl: string;
}

export const env: Environment = {
    EncounterId: null,
    PostedEncounter: null,
    HasStorage: false,
    HasEpicInitiative: false,
    IsLoggedIn: false,
    PatreonLoginUrl: "http://www.patreon.com/"
};

export function LoadEnvironment() {
    const html = document.getElementsByTagName("html")[0];

    env.EncounterId = html.getAttribute("encounterId");
    const encounterJSON = html.getAttribute("postedEncounter");
    if (encounterJSON) {
        env.PostedEncounter = JSON.parse(encounterJSON);
    }
    env.HasStorage = html.getAttribute("hasStorage") == "true";
    env.HasEpicInitiative = html.getAttribute("hasEpicInitiative") == "true";
    env.IsLoggedIn = html.getAttribute("isLoggedIn") == "true";
    if (window["patreonUrl"]) {
        env.PatreonLoginUrl = window["patreonUrl"];
    }
}
