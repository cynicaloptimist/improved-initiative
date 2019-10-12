export interface ClientEnvironment {
  EncounterId: string;
  PostedEncounter: { Combatants: {}[] } | null;
  IsLoggedIn: boolean;
  HasStorage: boolean;
  HasEpicInitiative: boolean;
  BaseUrl: string;
  PatreonLoginUrl: string;
  SentryDSN: string | null;
}
