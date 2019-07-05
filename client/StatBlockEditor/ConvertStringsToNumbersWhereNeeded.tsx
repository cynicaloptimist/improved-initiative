import { StatBlock } from "../../common/StatBlock";

export const ConvertStringsToNumbersWhereNeeded = (statBlock: StatBlock) => {
  StatBlock.AbilityNames.forEach(
    a => (statBlock.Abilities[a] = castToNumberOrZero(statBlock.Abilities[a]))
  );
  statBlock.HP.Value = castToNumberOrZero(statBlock.HP.Value);
  statBlock.AC.Value = castToNumberOrZero(statBlock.AC.Value);
  statBlock.InitiativeModifier = castToNumberOrZero(
    statBlock.InitiativeModifier
  );
  statBlock.Skills.forEach(s => (s.Modifier = castToNumberOrZero(s.Modifier)));
  statBlock.Saves.forEach(s => (s.Modifier = castToNumberOrZero(s.Modifier)));
};

function castToNumberOrZero(value?: any) {
  if (!value) {
    return 0;
  }
  const parsedValue = parseInt(value.toString(), 10);
  if (isNaN(parsedValue)) {
    return 0;
  }
  return parsedValue;
}
