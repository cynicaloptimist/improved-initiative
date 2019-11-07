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
  get String(): string {
    let output = `[${this.Rolls}]`;
    if (this.Modifier > 0) {
      output += ` + ${this.Modifier}`;
    }
    if (this.Modifier < 0) {
      output += ` - ${-this.Modifier}`;
    }
    return output + ` = ${this.Total}`;
  }
  get FormattedString(): string {
    const formattedRolls = this.Rolls.map(r => {
      if (r == this.DieSize) {
        return `<span class='s-roll-max'>${r.toString()}</span>`;
      }
      if (r == 1) {
        return `<span class='s-roll-min'>${r.toString()}</span>`;
      }
      return `<span class='s-roll'>${r.toString()}</span>`;
    }).join(", ");
    let output = `[${formattedRolls}]`;
    if (this.Modifier > 0) {
      output += ` + ${this.Modifier}`;
    }
    if (this.Modifier < 0) {
      output += ` - ${-this.Modifier}`;
    }
    return output + ` = ${this.Total}`;
  }
}
