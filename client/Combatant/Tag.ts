import * as ko from "knockout";

import { TagState } from "../../common/CombatantState";
import { DurationTiming } from "../../common/DurationTiming";
import { Combatant } from "./Combatant";

export const StartOfTurn: DurationTiming = "StartOfTurn";
export const EndOfTurn: DurationTiming = "EndOfTurn";

export interface Tag {
  Text: string;
  HasDuration: boolean;
  DurationRemaining: KnockoutObservable<number>;
  DurationTiming: DurationTiming;
  DurationCombatantId: string;
  NotExpired: KnockoutComputed<boolean>;
  Remove: () => void;
  Decrement: () => void;
  Increment: () => void;
}

export class Tag implements Tag {
  constructor(
    public Text: string,
    combatant: Combatant,
    public HiddenFromPlayerView: boolean,
    duration = -1,
    public DurationTiming = StartOfTurn,
    public DurationCombatantId = ""
  ) {
    this.HasDuration = duration > -1;
    this.DurationRemaining = ko.observable(duration);
    this.Remove = () => combatant.Tags.remove(this);
  }

  public Decrement = () => this.DurationRemaining(this.DurationRemaining() - 1);

  public Increment = () => this.DurationRemaining(this.DurationRemaining() + 1);

  public NotExpired = ko.pureComputed(() => {
    return !this.HasDuration || this.DurationRemaining() > 0;
  });

  public static getLegacyTags = (
    tags: (any)[],
    combatant: Combatant
  ): Tag[] => {
    return tags.map(tag => {
      if (tag.Text) {
        const savedTag: TagState = tag;
        return new Tag(
          savedTag.Text,
          combatant,
          savedTag.Hidden || false,
          savedTag.DurationRemaining,
          savedTag.DurationTiming,
          savedTag.DurationCombatantId
        );
      }
      return new Tag(tag, combatant, false);
    });
  };
}
