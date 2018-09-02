import { CombatantCommander } from "./CombatantCommander";
import { Command } from "./Command";

export const BuildCombatantCommandList: (c: CombatantCommander) => Command[] = c => [
    new Command("apply-damage", "Damage/Heal", c.EditHP, "t", "plus-circle"),
    new Command("apply-temporary-hp", "Apply Temporary HP", c.AddTemporaryHP, "alt+t", "medkit", false),
    new Command("add-tag", "Add Tag", c.AddTag, "g", "tag", false),
    new Command("remove", "Remove from Encounter", c.Remove, "del", "times"),
    new Command("set-alias", "Rename", c.SetAlias, "f2", "i-cursor"),
    new Command("edit-statblock", "Edit Statblock", c.EditStatBlock, "alt+e", "edit", false),
    new Command("set-initiative", "Edit Initiative", c.EditInitiative, "alt+i", "stopwatch", false),
    new Command("link-initiative", "Link Initiative", c.LinkInitiative, "alt+l", "link", false),
    new Command("move-down", "Move Down", c.MoveDown, "alt+j", "angle-double-down"),
    new Command("move-up", "Move Up", c.MoveUp, "alt+k", "angle-double-up"),
    new Command("select-next", "Select Next", c.SelectNext, "j", "arrow-down", false),
    new Command("select-previous", "Select Previous", c.SelectPrevious, "k", "arrow-up", false)
];
