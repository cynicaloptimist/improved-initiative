module ImprovedInitiative {
  export class ViewModel {
    UserPollQueue = new UserPollQueue();
    StatBlockEditor = new StatBlockEditor();
    Encounter = ko.observable(new Encounter(this.UserPollQueue, this.StatBlockEditor));
    Library = new CreatureLibrary(this.StatBlockEditor);
    
    SaveEncounter = () => {
      this.UserPollQueue.Add({
        requestContent: `<p>Save Encounter As: <input class='response' type='text' value='' /></p>`,
        inputSelector: '.response',
        callback: (response: string) => {
          var savedEncounter = this.Encounter().Save(response);
          var savedEncounters = this.Library.SavedEncounterIndex;
          if(savedEncounters.indexOf(response) == -1){
            savedEncounters().push(response);
          }
          localStorage.setItem('ImprovedInitiative.SavedEncounters', JSON.stringify(savedEncounters()));
          localStorage.setItem(`ImprovedInitiative.SavedEncounters.${response}`, JSON.stringify(savedEncounter));
        }
      })
    }
    LoadEncounterByName = (encounterName: string) => {
      var encounterJSON = localStorage.getItem(`ImprovedInitiative.SavedEncounters.${encounterName}`);
      if(encounterJSON === 'undefined'){
        throw `Couldn't find encounter '${encounterName}'`;
      }
      this.Encounter().Creatures([]);
      this.Encounter().CreatureCountsByName = [];
      this.Encounter().AddSavedEncounter(JSON.parse(encounterJSON))
      this.RegisterKeybindings();
    }
    
    LaunchPlayerWindow = () => {
      window.open('../p/' + this.Encounter().EncounterId, 'Player View');
    }
    
    ShowLibraries = () => {
      $('.libraries').slideDown();
    }
    
    Commands = BuildCommandList(this);
    
    ToggleCommandDisplay = () => {
      if ($('.commands').toggle().css('display') == 'none'){
        this.RegisterKeybindings();
      }
    }
    
    RegisterKeybindings(){
      Mousetrap.reset();
      this.Commands.forEach(b => Mousetrap.bind(b.KeyBinding, b.GetActionBinding()))
    }
  }
}