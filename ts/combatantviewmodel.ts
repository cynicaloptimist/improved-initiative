module ImprovedInitiative {
  export class CombatantViewModel {
    DisplayHP: () => void;
    PlayerDisplayHP: () => void;
    
    constructor(public Creature: Creature, public PollUser: (poll: IUserPoll) => void){
      this.DisplayHP = ko.pureComputed(() => {
        if(this.Creature.TemporaryHP()){
          return '{0}+{1}/{2}'.format(this.Creature.CurrentHP(), this.Creature.TemporaryHP(), this.Creature.MaxHP);
        } else {
          return '{0}/{1}'.format(this.Creature.CurrentHP(), this.Creature.MaxHP);
        }
      })
      this.PlayerDisplayHP = ko.pureComputed(() => {
        if(this.Creature.IsPlayerCharacter){
          return this.DisplayHP();
        }
        if(this.Creature.Encounter.Rules.EnemyHPTransparency == "whenBloodied"){
          if(this.Creature.CurrentHP() <= 0){
            return "<span class='defeatedHP'>Defeated</span>";
          } else if (this.Creature.CurrentHP() < this.Creature.MaxHP / 2){
            return "<span class='bloodiedHP'>Bloodied</span>";
          } else if (this.Creature.CurrentHP() < this.Creature.MaxHP){
            return "<span class='hurtHP'>Hurt</span>";
          }
          return "<span class='healthyHP'>Healthy</span>";
        } else {
          if(this.Creature.CurrentHP() <= 0){
              return "<span class='defeatedHP'>Defeated</span>";
            }
          return "<span class='healthyHP'>Healthy</span>";
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
    
    HiddenClass = ko.computed(() => {
      return this.Creature.Hidden() ? 'fa-eye-slash' : 'fa-eye';
    })
    
    ToggleHidden = (data, event) => {
      this.Creature.Hidden(!this.Creature.Hidden());
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
  
  ko.components.register('playerdisplaycombatant', {
    viewModel: function(params) {
      params.creature.ViewModel = new CombatantViewModel(params.creature, params.addUserPoll);
      return params.creature.ViewModel;
    },
    template: { name: 'playerdisplaycombatant' }
  })
}