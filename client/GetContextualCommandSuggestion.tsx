export function GetContextualCommandSuggestion(
  encounterEmpty: boolean,
  librariesVisible: boolean,
  encounterActive: boolean
) {
  if (encounterEmpty) {
    if (librariesVisible) {
      //No creatures, Library open: Creature listing
      return "listing";
    } else {
      //No creatures, library closed: Add Creatures
      return "add-creatures";
    }
  }

  if (!encounterActive) {
    //Creatures, encounter stopped: Start Encounter
    return "start-encounter";
  }

  if (librariesVisible) {
    //Creatures, library open, encounter active: Hide Libraries
    return "hide-libraries";
  }

  //Creatures, library closed, encounter active: Next turn
  return "next-turn";
}
