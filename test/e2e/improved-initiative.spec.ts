import { BrowserContext, expect, Page, test } from "@playwright/test";

const baseURL = "http://127.0.0.1:3100";

type PlayerViewSettingsSeed = {
  CustomCSS?: string;
  CustomStyles?: Record<string, string>;
  MonsterHPVerbosity?: string;
};

test.beforeEach(async ({ context, page }) => {
  await blockExternalRequests(context);
  await seedPreferences(page);
});

test("managed Player View styles apply and custom CSS can override them", async ({
  browser,
  page
}) => {
  await seedPreferences(page, {
    CustomCSS:
      '[data-ii-role="combatant"][data-ii-health="healthy"] ' +
      "{ color: rgb(1, 2, 3); }",
    CustomStyles: {
      mainBackground: "#101820",
      combatantBackground: "#202020",
      combatantText: "#abcdef",
      activeCombatantIndicator: "#405060",
      headerBackground: "#506070",
      headerText: "#f0f1f2",
      backgroundUrl: "",
      font: "Arial"
    },
    MonsterHPVerbosity: "Actual HP"
  });

  const encounterId = await openTracker(page);
  await addCombatant(page, "Style Sentinel", 20, 15, 5);
  await startEncounter(page);

  const playerContext = await browser.newContext();
  await blockExternalRequests(playerContext);
  const playerPage = await playerContext.newPage();
  await playerPage.goto(`/p/${encounterId}`);

  await expect(
    playerPage.locator('[data-ii-role="player-view"]')
  ).toBeVisible();
  await expect(
    playerPage.locator('[data-ii-role="combatant-list"]')
  ).toBeVisible();
  const activeCombatant = playerPage.locator(
    '[data-ii-role="combatant"][data-ii-state="active"]'
  );
  await expect(activeCombatant).toContainText("Style Sentinel");
  await expect(activeCombatant).toHaveAttribute(
    "data-ii-kind",
    "non-player-character"
  );
  await expect(activeCombatant).toHaveAttribute("data-ii-health", "healthy");
  for (const field of ["initiative", "name", "hit-points", "tags"]) {
    await expect(
      activeCombatant.locator(`[data-ii-field="${field}"]`)
    ).toBeVisible();
  }
  await expect(activeCombatant).toHaveCSS(
    "background-color",
    "rgb(39, 39, 39)"
  );
  await expect(activeCombatant).toHaveCSS(
    "border-left-color",
    "rgb(64, 80, 96)"
  );
  await expect(activeCombatant).toHaveCSS("color", "rgb(1, 2, 3)");
  await expect(activeCombatant).toHaveCSS("font-family", "Arial, sans-serif");
  await expect(
    playerPage.locator('[data-ii-role="combatant-header"]')
  ).toHaveCSS("background-color", "rgb(80, 96, 112)");
  await expect(
    playerPage.locator('[data-ii-role="combatant-header"]')
  ).toHaveCSS("color", "rgb(240, 241, 242)");
  await expect(playerPage.locator("body")).toHaveCSS(
    "background-color",
    "rgb(16, 24, 32)"
  );

  await playerContext.close();
});

test("Player View follows combat changes and restores them after reconnecting", async ({
  browser,
  page
}) => {
  await seedPreferences(page, { MonsterHPVerbosity: "Actual HP" });

  const encounterId = await openTracker(page);
  await addCombatant(page, "Aster", 20, 15, 5);
  await addCombatant(page, "Bramble", 18, 13, 2);
  await startEncounter(page);

  const playerContext = await browser.newContext();
  await blockExternalRequests(playerContext);
  const playerPage = await playerContext.newPage();
  await playerPage.goto(`/p/${encounterId}`);
  await expect(playerPage.locator("li.combatant")).toHaveCount(2);

  const originalActiveName = await activeTrackerCombatantName(page);
  await expect(activePlayerCombatant(playerPage)).toHaveText(
    originalActiveName
  );

  await page.locator(".c-button--next-turn").click();
  await expect(activeTrackerCombatant(page)).not.toHaveText(originalActiveName);
  const nextActiveName = await activeTrackerCombatantName(page);
  await expect(activePlayerCombatant(playerPage)).toHaveText(nextActiveName);

  await applyDamage(page, "Aster", 3);
  await expect(playerCombatant(playerPage, "Aster")).toContainText("17/20");

  await playerPage.reload();
  await expect(activePlayerCombatant(playerPage)).toHaveText(nextActiveName);
  await expect(playerCombatant(playerPage, "Aster")).toContainText("17/20");

  await playerContext.close();
});

test("autosave restores encounter state after Tracker reloads", async ({
  page
}) => {
  await openTracker(page);
  await addCombatant(page, "Recovery Knight", 30, 16, 4);
  await addCombatant(page, "Backup Mage", 16, 12, 3);
  await startEncounter(page);
  await page.locator(".c-button--next-turn").click();
  const activeName = await activeTrackerCombatantName(page);
  await applyDamage(page, "Recovery Knight", 7);

  await expect
    .poll(() =>
      page.evaluate(() => {
        const storedState = localStorage.getItem(
          "ImprovedInitiative.AutoSavedEncounters.default"
        );
        if (!storedState) {
          return null;
        }
        const encounter = JSON.parse(storedState);
        const recoveryKnight = encounter.Combatants.find(
          combatant => combatant.StatBlock.Name == "Recovery Knight"
        );
        const activeCombatant = encounter.Combatants.find(
          combatant => combatant.Id == encounter.ActiveCombatantId
        );
        return {
          activeName: activeCombatant?.StatBlock.Name,
          recoveryKnightHP: recoveryKnight?.CurrentHP
        };
      })
    )
    .toEqual({ activeName, recoveryKnightHP: 23 });

  await page.reload();
  await trackerReady(page);

  await expect(trackerCombatant(page, "Recovery Knight")).toContainText(
    "23/30"
  );
  await expect(page.locator("tr.combatant")).toHaveCount(2);
  await expect(activeTrackerCombatant(page)).toHaveText(activeName);
});

async function blockExternalRequests(context: BrowserContext) {
  await context.route(
    url => url.protocol.startsWith("http") && url.origin !== baseURL,
    route => route.abort()
  );
}

async function seedPreferences(
  page: Page,
  playerView: PlayerViewSettingsSeed = {}
) {
  await page.addInitScript(settings => {
    const userKeys = ["SkipIntro", "AllowTracking", "Settings"];
    localStorage.setItem("ImprovedInitiative.User", JSON.stringify(userKeys));
    localStorage.setItem("ImprovedInitiative.User.SkipIntro", "true");
    localStorage.setItem("ImprovedInitiative.User.AllowTracking", "false");
    localStorage.setItem(
      "ImprovedInitiative.User.Settings",
      JSON.stringify({ PlayerView: settings })
    );
  }, playerView);
}

async function openTracker(page: Page) {
  await page.goto("/e/");
  await trackerReady(page);
  const environmentJSON = await page
    .locator("html")
    .getAttribute("environmentJSON");
  if (!environmentJSON) {
    throw new Error("Tracker environment is missing");
  }
  return JSON.parse(environmentJSON).EncounterId as string;
}

async function trackerReady(page: Page) {
  await expect(page.locator(".loading-splash")).toBeHidden();
  await expect(page.locator(".initiative-list")).toBeVisible();
}

async function addCombatant(
  page: Page,
  name: string,
  hp: number,
  armorClass: number,
  initiative: number
) {
  await page
    .getByText("Quick Add a Combatant without a Statblock", { exact: true })
    .click();
  const prompt = page.locator(".p-quick-add");
  await expect(prompt).toBeVisible();
  await prompt.locator("input[name=Name]").fill(name);
  await prompt.locator("input[name=MaxHP]").fill(hp.toString());
  await prompt.locator("input[name=AC]").fill(armorClass.toString());
  await prompt.locator("input[name=Initiative]").fill(initiative.toString());
  await prompt.locator("button[type=submit]").click();
  await expect(page.getByRole("button", { name })).toBeVisible();
}

async function startEncounter(page: Page) {
  await page.locator(".c-button--start-encounter").click();
  await page.locator(".roll-initiative button[type=submit]").click();
  await expect(activeTrackerCombatant(page)).toBeVisible();
}

async function applyDamage(page: Page, name: string, damage: number) {
  await trackerCombatant(page, name).locator(".combatant__hp-outer").click();
  const prompt = page.locator(".p-apply-damage");
  await prompt.locator("input[name=damageAmount]").fill(damage.toString());
  await prompt.locator("button[type=submit]").click();
}

function trackerCombatant(page: Page, name: string) {
  return page.locator("tr.combatant").filter({
    has: page.getByRole("button", { name, exact: true })
  });
}

function activeTrackerCombatant(page: Page) {
  return page.locator("tr.combatant.active .combatant__selection-button");
}

async function activeTrackerCombatantName(page: Page) {
  return (await activeTrackerCombatant(page).innerText()).trim();
}

function playerCombatant(page: Page, name: string) {
  return page.locator('[data-ii-role="combatant"]').filter({ hasText: name });
}

function activePlayerCombatant(page: Page) {
  return page.locator(
    '[data-ii-role="combatant"][data-ii-state="active"] ' +
      '[data-ii-field="name"]'
  );
}
