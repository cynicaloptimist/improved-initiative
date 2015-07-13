module ImprovedInitiative {
  interface IHaveValue{
    Value: number;
  }
  
  export interface IHaveAbilities{
    Str: number;
    Dex: number;
    Con: number;
    Cha: number;
    Int: number;
    Wis: number;
  }
  
  interface IHaveAModifier{
    Name: string;
    Modifier: number;
  }
  
  interface IHaveNotes {
    Value: string;
    Notes: string;
  }
  
  interface IHaveContent{
    Name: string;
    Content: string;
  }
  
  interface IUsableTrait {
    Name: string;
    Content: string;
    Usage?: string;
  }
  
  export interface IHaveTrackerStats {
    Player?: string;
    Type?: string;
    Name: string;
    HP: IHaveValue;
    AC: IHaveValue;
    InitiativeModifier?: number;
    Abilities: IHaveAbilities;
  }
  
  export interface IStatBlock {
      Name: string; 
      Type: string;
      HP: IHaveValue;
      AC: IHaveValue;
      Speed: string [];
      Abilities: IHaveAbilities;
      InitiativeModifier?: number;
      DamageVulnerabilities: string []; 
      DamageResistances: string []; 
      DamageImmunities: string [];
      ConditionImmunities: string [];
      Saves: IHaveAModifier[];
      Skills: IHaveAModifier[];
      Senses: string [];
      Languages: string [];
      Challenge: string;
      Traits: IUsableTrait [];
      Actions: IUsableTrait [];
      LegendaryActions: IUsableTrait [];
      Player: string;
  }
  
  export class StatBlock {
    static Empty = (mutator?: (s: IStatBlock) => void): IStatBlock => {
      var statBlock =  {
        Name: '', Type: '', 
        HP: { Value: 1, Notes: ''},  AC: { Value: 10, Notes: ''},
        Speed: [],
        Abilities: { Str: 10, Dex: 10, Con: 10, Cha: 10, Int: 10, Wis: 10 },
        DamageVulnerabilities: [], DamageResistances: [], DamageImmunities: [], ConditionImmunities: [],
        Saves: [], Skills: [], Senses: [], Languages: [],
        Challenge: '',
        Traits: [],
        Actions: [],
        LegendaryActions: [],
        Player: ''
      };
      if(mutator) { mutator(statBlock) };
      return statBlock;
    }
    
    static AbilityNames = ["Str", "Dex", "Con", "Cha", "Int", "Wis"]
	}
}