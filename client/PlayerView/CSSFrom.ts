import * as Color from "color";
import { PlayerViewCustomStyles } from "../../common/PlayerViewSettings";

export function CSSFrom(
  customStyles: PlayerViewCustomStyles,
  temporaryBackgroundImageUrl?: string
): string {
  const customProperties: string[] = [];
  if (customStyles.combatantText) {
    customProperties.push(
      `--ii-player-view-combatant-text: ${customStyles.combatantText};`
    );
  }
  if (customStyles.combatantBackground) {
    const baseColor = Color(customStyles.combatantBackground);
    let zebraColor = "",
      activeColor = "";
    if (baseColor.isDark()) {
      zebraColor = baseColor.lighten(0.1).string();
      activeColor = baseColor.lighten(0.2).string();
    } else {
      zebraColor = baseColor.darken(0.1).string();
      activeColor = baseColor.darken(0.2).string();
    }
    customProperties.push(
      `--ii-player-view-combatant-background: ${customStyles.combatantBackground};`
    );
    customProperties.push(
      `--ii-player-view-combatant-zebra-background: ${zebraColor};`
    );
    customProperties.push(
      `--ii-player-view-active-combatant-background: ${activeColor};`
    );
  }
  if (customStyles.activeCombatantIndicator) {
    customProperties.push(
      `--ii-player-view-active-combatant-indicator: ${customStyles.activeCombatantIndicator};`
    );
  }
  if (customStyles.headerText) {
    customProperties.push(
      `--ii-player-view-header-text: ${customStyles.headerText};`
    );
  }
  if (customStyles.headerBackground) {
    customProperties.push(
      `--ii-player-view-header-background: ${customStyles.headerBackground};`
    );
  }
  if (customStyles.mainBackground) {
    customProperties.push(
      `--ii-player-view-main-background: ${customStyles.mainBackground};`
    );
  }
  const backgroundImageUrl =
    temporaryBackgroundImageUrl || customStyles.backgroundUrl;
  if (backgroundImageUrl) {
    customProperties.push(
      `--ii-player-view-background-image: url(${backgroundImageUrl});`
    );
  } else if (customStyles.mainBackground) {
    customProperties.push("--ii-player-view-background-image: none;");
  }
  if (customStyles.font) {
    customProperties.push(
      `--ii-player-view-font-family: "${customStyles.font}", sans-serif;`
    );
  }
  if (customProperties.length == 0) {
    return "";
  }
  return `:root { ${customProperties.join(" ")} }`;
}
