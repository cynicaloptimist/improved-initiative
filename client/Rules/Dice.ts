export const RollModes = {
  Advantage: "advantage",
  Disadvantage: "disadvantage"
} as const;

export type RollMode = (typeof RollModes)[keyof typeof RollModes];

export const rollDie = (size: number): number =>
  Math.floor(Math.random() * size) + 1;

export class DiceRoll {
  public readonly Results: readonly number[];
  public readonly Total: number;
  public readonly ChosenIndex: number | undefined;

  constructor(
    public readonly DiceCount: number,
    public readonly DieSize: number,
    public readonly Modifier: number,
    public readonly Mode: RollMode | undefined = undefined,
    existingRoll?: number
  ) {
    if (
      this.Mode !== undefined &&
      (this.DieSize !== 20 || this.DiceCount !== 1)
    ) {
      throw new Error("A roll mode can only be added to a single d20 roll");
    }
    this.Results = Object.freeze(this.roll(existingRoll));
    this.ChosenIndex = this.chooseIndex();
    this.Total = this.calculateTotal();
  }

  private roll(existingRoll?: number): readonly number[] {
    const rollCount = this.Mode === undefined ? this.DiceCount : 2;
    const rolls: number[] = existingRoll === undefined ? [] : [existingRoll];

    while (rolls.length < rollCount) {
      rolls.push(rollDie(this.DieSize));
    }

    return rolls;
  }

  private calculateTotal() {
    const diceTotal =
      this.ChosenIndex === undefined
        ? this.Results.reduce((total, roll) => total + roll, 0)
        : this.Results[this.ChosenIndex];

    return diceTotal + this.Modifier;
  }

  private chooseIndex() {
    if (this.Mode === undefined || this.Results.length !== 2) {
      return undefined;
    }

    const firstWins = this.Results[0] > this.Results[1];
    if (firstWins) {
      return this.Mode === RollModes.Advantage ? 0 : 1;
    }

    return this.Mode === RollModes.Advantage ? 1 : 0;
  }

  CanSelectMode(): boolean {
    return (
      this.Mode === undefined &&
      this.DiceCount === 1 &&
      this.DieSize === 20 &&
      this.Results.length === 1
    );
  }

  get ModifierText(): string {
    if (this.Modifier === 0) {
      return "";
    }

    const operator = this.Modifier > 0 ? "+" : "-";
    return ` ${operator} ${Math.abs(this.Modifier)}`;
  }

  ToResultString(): string {
    let modeSuffix = "";
    if (this.Mode !== undefined) {
      modeSuffix = this.Mode === RollModes.Advantage ? "a" : "d";
    }
    return `[${this.Results}]${modeSuffix}${this.ModifierText} = ${this.Total}`;
  }

  Reroll(): DiceRoll {
    return new DiceRoll(this.DiceCount, this.DieSize, this.Modifier, this.Mode);
  }

  WithMode(mode: RollMode): DiceRoll {
    if (!this.CanSelectMode()) {
      throw new Error("A roll mode can only be added to a single d20 roll");
    }

    return new DiceRoll(
      this.DiceCount,
      this.DieSize,
      this.Modifier,
      mode,
      this.Results[0]
    );
  }
}
