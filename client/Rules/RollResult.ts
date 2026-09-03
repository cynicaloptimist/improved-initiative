export class RollResult {
  constructor(
    public Rolls: number[],
    public Modifier: number,
    public DieSize: number
  ) {}
  get Maximum(): number {
    return this.DieSize * this.Rolls.length + this.Modifier;
  }
  get Total(): number {
    return this.Rolls.reduce((p, c) => c + p, 0) + this.Modifier;
  }

  /**
   * {@returns} empty string when the modifier is 0, " +X" or "-Y" otherwise (with a leading space)
   */
  get ModifierText(): string {
    if (this.Modifier === 0) {
      return ""
    }
    const absModifier = Math.abs(this.Modifier);
    return ` ${this.Modifier > 0 ? "+" : "-"} ${absModifier}`;
  }

  get ResultString(): string {
    return `[${this.Rolls}]${this.ModifierText} = ${this.Total}`
  }
}
