module ImprovedInitiative {
    export const StartOfTurn: DurationTiming = "StartOfTurn";
    export const EndOfTurn: DurationTiming = "EndOfTurn";
    export type DurationTiming = "StartOfTurn" | "EndOfTurn";

    export interface Tag {
        Text: string;
        HasDuration: boolean;
        DurationRemaining: number;
        DurationTiming: DurationTiming;
    }

    export class Tag implements Tag {
        constructor(public Text: string, public HasDuration = false, public DurationRemaining = 0, public DurationTiming = StartOfTurn) {

        }

        public static getLegacyTags = (tags: any []): Tag[] => {
            return tags.map(tag => {
                if (tag.Text) {
                    return tag;
                }
                return new Tag(tag);
            });
        }
    }
}