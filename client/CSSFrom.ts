import * as Color from "color";
import { PlayerViewCustomStyles } from "../common/PlayerViewSettings";

export function CSSFrom(
  customStyles: PlayerViewCustomStyles,
  temporaryBackgroundImageUrl?: string
): string {
  const declarations: string[] = [];
  if (customStyles.combatantText) {
    declarations.push(`li.combatant { color: ${customStyles.combatantText}; }`);
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
    declarations.push(
      `.combatant { background-color: ${customStyles.combatantBackground}; }`
    );
    declarations.push(
      `.combatant:nth-child(2n-1) { background-color: ${zebraColor}; }`
    );
    declarations.push(
      `.combatant.active { background-color: ${activeColor}; }`
    );
  }
  if (customStyles.activeCombatantIndicator) {
    declarations.push(
      `.combatant.active { border-color: ${
        customStyles.activeCombatantIndicator
      } }`
    );
  }
  if (customStyles.headerText) {
    declarations.push(
      `.combatant--header, .combat-footer { color: ${
        customStyles.headerText
      }; }`
    );
  }
  if (customStyles.headerBackground) {
    declarations.push(
      `.combatant--header, .combat-footer { background-color: ${
        customStyles.headerBackground
      }; border-color: ${customStyles.headerBackground} }`
    );
  }
  if (customStyles.mainBackground) {
    declarations.push(
      `#playerview { background-color: ${customStyles.mainBackground}; }`
    );
    if (!customStyles.backgroundUrl) {
      declarations.push(`#playerview { background-image: none; }`);
    }
  }
  if (temporaryBackgroundImageUrl || customStyles.backgroundUrl) {
    declarations.push(
      `#playerview { background-image: url(${temporaryBackgroundImageUrl ||
        customStyles.backgroundUrl}); }`
    );
  }
  if (customStyles.font) {
    declarations.push(`* { font-family: "${customStyles.font}", sans-serif; }`);
  }
  return declarations.join(" ");
}
