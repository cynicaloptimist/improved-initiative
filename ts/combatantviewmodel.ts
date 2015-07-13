module ImprovedInitiative {
  export class CombatantViewModel {
    DisplayHP: () => void;
    
    constructor(public Creature: Creature, public PollUser: (poll: IUserPoll) => void){
      this.DisplayHP = ko.pureComputed(() => {
        if(this.Creature.TemporaryHP()){
          return '{0}+{1}/{2}'.format(this.Creature.CurrentHP(), this.Creature.TemporaryHP(), this.Creature.MaxHP);
        } else {
          return '{0}/{1}'.format(this.Creature.CurrentHP(), this.Creature.MaxHP);
        }
      })
    }
    
    private applyDamage = inputDamage => {
      var damage = parseInt(inputDamage),
          healing = -damage,
          currHP = this.Creature.CurrentHP(), 
          tempHP = this.Creature.TemporaryHP();
      
      if(isNaN(damage)){
        return
      }
      
      if(damage > 0){
        tempHP -= damage;
        if(tempHP < 0){
          currHP += tempHP;
          tempHP = 0;
        }
      } else {
        currHP += healing;
        if(currHP > this.Creature.MaxHP)
        {
          currHP = this.Creature.MaxHP;
        }
      }
      
      this.Creature.CurrentHP(currHP);
      this.Creature.TemporaryHP(tempHP);
    }
    
    private applyTemporaryHP = inputTHP => {
      var newTemporaryHP = parseInt(inputTHP),
          currentTemporaryHP = this.Creature.TemporaryHP();
          
      if(isNaN(newTemporaryHP)){
        return
      }
      
      if(newTemporaryHP > currentTemporaryHP) {
        currentTemporaryHP = newTemporaryHP;
      }
      
      this.Creature.TemporaryHP(currentTemporaryHP);
    }
    
    GetHPColor = () => {
      var green = Math.floor((this.Creature.CurrentHP() / this.Creature.MaxHP) * 170);
      var red = Math.floor((this.Creature.MaxHP - this.Creature.CurrentHP()) / this.Creature.MaxHP * 170);
      return "rgb(" + red + "," + green + ",0)";
    };
    
    EditHP = () => {
      this.PollUser({
        requestContent: `Apply damage to ${this.Creature.Alias()}: <input class='response' type='number' />`,
        inputSelector: '.response',
        callback: this.applyDamage
      });
    }
    
    AddTemporaryHP = () => {
      this.PollUser({
        requestContent: `Grant temporary hit points to ${this.Creature.Alias()}: <input class='response' type='number' />`,
        inputSelector: '.response',
        callback: this.applyTemporaryHP
      });
    }
    
    
    EditingName = ko.observable(false);
    
    CommitName = () => {
      this.EditingName(false);
    };
    
    AddingTag = ko.observable(false);
    
    NewTag = ko.observable(null);
    
    CommitTag = () => {
      this.Creature.Tags.push(this.NewTag());
      this.NewTag(null);
      this.AddingTag(false);
    };
    
    RemoveTag = (tag: string) => {
      this.Creature.Tags.splice(this.Creature.Tags.indexOf(tag), 1);
    };
      
      
  }
  
  ko.components.register('combatant', {
    viewModel: function(params) {
      params.creature.ViewModel = new CombatantViewModel(params.creature, params.addUserPoll);
      return params.creature.ViewModel;
    },
    template: { name: 'combatant' }
  })
}