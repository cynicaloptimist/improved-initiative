module ImprovedInitiative {
	export interface IRules{
    Modifier: (attribute:number) => number;
    Check: (...mods : number[]) => number;
    GroupSimilarCreatures: boolean;
  }
  
  export class DefaultRules implements IRules {
    Modifier = (attribute: number) =>
    {
      return Math.floor((attribute - 10) / 2);
    }
    Check = (...mods: number[]) => 
    {
      return Math.ceil(Math.random() * 20) + mods.reduce((p,c) => p + c);
    }
    GroupSimilarCreatures = false;
  }
}