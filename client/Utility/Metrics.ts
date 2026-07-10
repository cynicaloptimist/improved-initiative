import axios from "axios";
import { env } from "../Environment";
import { LegacySynchronousLocalStore } from "./LegacySynchronousLocalStore";
import { Store } from "./Store";

declare let gtag: Gtag.Gtag | undefined;

let didSetConsent = false;

enum MetricEvent {
  AliasSet = "alias_set",
  AllPlayerCharacterHpRestored = "all_player_character_hp_restored",
  AppLoad = "app_load",
  BannerClick = "banner_click",
  CombatantAcHidden = "combatant_ac_hidden",
  CombatantAcRevealed = "combatant_ac_revealed",
  CombatantAdded = "combatant_added",
  CombatantDefeated = "combatant_defeated",
  CombatantHidden = "combatant_hidden",
  CombatantQuickAdded = "combatant_quick_added",
  CombatantRevealed = "combatant_revealed",
  CombatantStatBlockQuickEdited = "combatant_statblock_quick_edited",
  CombatantsRemoved = "combatants_removed",
  CombatantsSelected = "combatants_selected",
  ConcentrationCheckTriggered = "concentration_check_triggered",
  CustomStatBlockFieldAdded = "custom_statblock_field_added",
  DamageApplied = "damage_applied",
  DamageSuggested = "damage_suggested",
  DiceRolled = "dice_rolled",
  EncounterCleaned = "encounter_cleaned",
  EncounterCleared = "encounter_cleared",
  EncounterEnded = "encounter_ended",
  EncounterLoaded = "encounter_loaded",
  EncounterMoved = "encounter_moved",
  EncounterSaved = "encounter_saved",
  EncounterStarted = "encounter_started",
  FullscreenToggled = "fullscreen_toggled",
  GenerateLead = "generate_lead",
  InitiativeLinked = "initiative_linked",
  InitiativeRerolled = "initiative_rerolled",
  InitiativeSet = "initiative_set",
  LandingPageLoad = "landing_page_load",
  LibraryManagerOpened = "library_manager_opened",
  Login = "login",
  NotesUpdated = "notes_updated",
  PatreonAccessDenied = "patreon_access_denied",
  PersistentCharacterAdded = "persistent_character_added",
  PlayerViewLaunched = "player_view_launched",
  SettingsOpened = "settings_opened",
  SettingsSaved = "settings_saved",
  SpellImported = "spell_imported",
  StatBlockDeleted = "statblock_deleted",
  StatBlockImported = "statblock_imported",
  TagAdded = "tag_added",
  TagAddedFromSuggestion = "tag_added_from_suggestion",
  TemporaryHpAdded = "temporary_hp_added",
  TutorialBegin = "tutorial_begin",
  TutorialComplete = "tutorial_complete",
  TurnCompleted = "turn_completed",
  ViewPromotion = "view_promotion"
}

enum MetricLeadSource {
  AccountTabExistingSupporterLogin = "account_tab_existing_supporter_login",
  AccountTabSaveSync = "account_tab_save_sync",
  AboutTabSupporterBenefits = "about_tab_supporter_benefits",
  EpicTabExistingSupporterLogin = "epic_tab_existing_supporter_login",
  EpicTabUnlockEpic = "epic_tab_unlock_epic",
  FooterBanner = "footer_banner",
  ImporterLoginFail = "importer_login_fail",
  PlayerViewCustomizationGate = "player_view_customization_gate",
  StickyPatreonLogin = "sticky_patreon_login"
}

enum MetricCreativeName {
  StickyPatreonLoginV1 = "sticky_patreon_login_v1"
}

enum MetricPatreonEvent {
  ExtensionAccessDenied = "extension_access_denied",
  JoinClicked = "join_clicked",
  LoginStarted = "login_started",
  LoginSucceeded = "login_succeeded"
}

enum MetricAccountStatus {
  Anonymous = "anonymous",
  LoggedInNoPatreon = "logged_in_no_patreon",
  AccountSyncActive = "account_sync_active",
  EpicActive = "epic_active",
  MythicActive = "mythic_active"
}

export class Metrics {
  public static readonly Event = MetricEvent;
  public static readonly LeadSource = MetricLeadSource;
  public static readonly CreativeName = MetricCreativeName;
  public static readonly PatreonEvent = MetricPatreonEvent;
  public static readonly AccountStatus = MetricAccountStatus;

  public static async TrackLoad(): Promise<void> {
    const counts = {
      encounters: await Store.Count(Store.SavedEncounters),
      npc_statblocks: await Store.Count(Store.StatBlocks),
      pc_statblocks: LegacySynchronousLocalStore.List(
        LegacySynchronousLocalStore.PlayerCharacters
      ).length,
      persistent_characters: await Store.Count(Store.PersistentCharacters),
      spells: await Store.Count(Store.Spells)
    };

    Metrics.TrackEvent(Metrics.Event.AppLoad, counts);
    const queryParams = new URLSearchParams(window.location.search);
    const loginMethod = queryParams.get("login");
    if (loginMethod) {
      if (loginMethod == "patreon") {
        Metrics.TrackPatreonLoginSucceeded();
      } else {
        Metrics.TrackEvent(Metrics.Event.Login, {
          method: loginMethod
        });
      }
      Metrics.RecordGoogleAnalyticsClientId();
      queryParams.delete("login");
      window.history.replaceState(null, "", window.location.pathname);
    }
  }

  public static TrackPatreonSignupIntent(
    source: MetricLeadSource,
    eventData: Record<string, any> = {}
  ): void {
    Metrics.TrackPatreonFunnelEvent(Metrics.Event.GenerateLead, source, {
      patreon_event: Metrics.PatreonEvent.JoinClicked,
      ...eventData
    });
  }

  public static TrackPatreonLoginStarted(
    source: MetricLeadSource,
    eventData: Record<string, any> = {}
  ): void {
    Metrics.TrackPatreonFunnelEvent(Metrics.Event.Login, source, {
      link_url: env.PatreonLoginUrl,
      method: "patreon",
      patreon_event: Metrics.PatreonEvent.LoginStarted,
      ...eventData
    });
  }

  public static TrackPatreonLoginSucceeded(
    eventData: Record<string, any> = {}
  ): void {
    Metrics.TrackEvent(Metrics.Event.Login, {
      account_status: Metrics.getAccountStatus(),
      method: "patreon",
      patreon_event: Metrics.PatreonEvent.LoginSucceeded,
      ...eventData
    });
  }

  public static TrackPatreonAccessDenied(
    source: MetricLeadSource,
    eventData: Record<string, any> = {}
  ): void {
    Metrics.TrackPatreonFunnelEvent(Metrics.Event.PatreonAccessDenied, source, {
      patreon_event: Metrics.PatreonEvent.ExtensionAccessDenied,
      ...eventData
    });
  }

  public static TrackPatreonCtaViewed(
    source: MetricLeadSource,
    eventData: Record<string, any> = {}
  ): void {
    Metrics.TrackPatreonFunnelEvent(
      Metrics.Event.ViewPromotion,
      source,
      eventData
    );
  }

  public static TrackPatreonFunnelEvent(
    eventName: MetricEvent,
    source: MetricLeadSource,
    eventData: Record<string, any> = {}
  ): void {
    Metrics.TrackAnonymousEvent(eventName, {
      account_status: Metrics.getAccountStatus(),
      lead_source: source,
      items: [
        {
          item_id: "patreon_membership",
          item_name: "Patreon Membership"
        }
      ],
      ...eventData
    });
  }

  public static TrackEvent(
    name: MetricEvent,
    eventData: Record<string, any> = {}
  ): void {
    if (
      !LegacySynchronousLocalStore.Load(
        LegacySynchronousLocalStore.User,
        "AllowTracking"
      )
    ) {
      return;
    }

    console.log(`Event ${name}`);
    if (Object.keys(eventData).length > 0) {
      console.table(eventData);
    }

    if (typeof gtag == "function") {
      try {
        if (!didSetConsent) {
          gtag("consent", "update", {
            analytics_storage: "granted"
          });
          didSetConsent = true;
        }

        gtag("event", name, eventData);
      } catch (e) {}
    }

    if (!env.SendMetrics) {
      return;
    }

    axios.post(
      `/recordEvent/${name}`,
      JSON.stringify({
        eventData,
        meta: Metrics.getLocalMeta()
      }),
      {
        headers: { "content-type": "application/json" }
      }
    );
  }

  public static TrackAnonymousEvent(
    name: MetricEvent,
    eventData: Record<string, any> = {}
  ): void {
    console.log(`Anonymous Event ${name}`);
    if (Object.keys(eventData).length > 0) {
      console.table(eventData);
    }

    if (typeof gtag == "function") {
      try {
        gtag("event", name, eventData);
      } catch (e) {}
    }

    if (!env.SendMetrics) {
      return;
    }

    axios.post(
      `/recordAnonymousEvent/${name}`,
      JSON.stringify({
        eventData,
        meta: Metrics.getLocalMeta()
      }),
      {
        headers: { "content-type": "application/json" }
      }
    );
  }

  public static RecordGoogleAnalyticsClientId(): void {
    if (!env.GoogleAnalyticsId || typeof gtag != "function") {
      return;
    }

    if (
      !LegacySynchronousLocalStore.Load(
        LegacySynchronousLocalStore.User,
        "AllowTracking"
      )
    ) {
      return;
    }

    try {
      gtag(
        "get",
        env.GoogleAnalyticsId,
        "client_id",
        googleAnalyticsClientId => {
          if (typeof googleAnalyticsClientId !== "string") {
            return;
          }

          axios.post(
            "/recordGoogleAnalyticsClientId",
            JSON.stringify({
              googleAnalyticsClientId,
              meta: Metrics.getLocalMeta()
            }),
            {
              headers: { "content-type": "application/json" }
            }
          );
        }
      );
    } catch (e) {}
  }

  private static getLocalMeta() {
    return {
      referrerUrl: document.referrer,
      pageUrl: document.URL,
      localTime: new Date().getTime()
    };
  }

  private static getAccountStatus(): MetricAccountStatus {
    if (!env.IsLoggedIn) {
      return Metrics.AccountStatus.Anonymous;
    }

    if (env.HasMythic) {
      return Metrics.AccountStatus.MythicActive;
    }

    if (env.HasEpicInitiative) {
      return Metrics.AccountStatus.EpicActive;
    }

    if (env.HasStorage) {
      return Metrics.AccountStatus.AccountSyncActive;
    }

    return Metrics.AccountStatus.LoggedInNoPatreon;
  }
}
