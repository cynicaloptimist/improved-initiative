export function interfacePriorityClass(
  centerColumnView: string,
  librariesVisible: boolean,
  hasPrompt: boolean,
  isACombatantSelected: boolean,
  encounterState: "active" | "inactive"
) {
  if (
    centerColumnView === "statblockeditor" ||
    centerColumnView === "spelleditor"
  ) {
    if (librariesVisible) {
      return "show-center-left-right";
    }
    return "show-center-right-left";
  }

  if (librariesVisible) {
    return "show-left-center-right";
  }

  if (hasPrompt) {
    if (isACombatantSelected) {
      return "show-center-right-left";
    }
    return "show-center-left-right";
  }

  if (isACombatantSelected) {
    return "show-right-center-left";
  }

  if (encounterState == "active") {
    return "show-center-left-right";
  }

  return "show-center-right-left";
}
