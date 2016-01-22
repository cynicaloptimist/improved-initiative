module ImprovedInitiative {
	export class Commander {
        Commands: Command [];
		SelectedCreatures: KnockoutObservableArray<ICreature> = ko.observableArray<ICreature>([]);
            
        constructor(private encounter: KnockoutObservable<Encounter>, 
                    private userPollQueue: UserPollQueue, 
                    private statBlockEditor: StatBlockEditor,
                    private library: CreatureLibrary) 
        { 
            this.Commands = BuildCommandList(this);
            Store.List('KeyBindings').forEach(k => {
                var keyBinding = Store.Load<string>('KeyBindings', k);
                this.Commands.find(c => c.Description == k).KeyBinding = keyBinding;
            })
            
        }
        
        SelectedCreatureStatblock: KnockoutComputed<IStatBlock> = ko.computed(() => 
        {
            var selectedCreatures = this.SelectedCreatures();
            if(selectedCreatures.length == 1){
                return selectedCreatures[0].StatBlock();
            } else {
                return StatBlock.Empty();
            }
        });
        
        AddCreatureFromListing = (listing: CreatureListing, event?) => {
            listing.LoadStatBlock(listing => {
                this.encounter().AddCreature(listing.StatBlock(), event);
            });
        }
        
        EditCreatureFromListing = (listing: CreatureListing) => {
            listing.LoadStatBlock(l => {
                this.statBlockEditor.EditCreature(l.StatBlock(), newStatBlock => {
                    l.StatBlock(newStatBlock);
                    l.Name(newStatBlock.Name);
                    if(newStatBlock.Player == "player"){
                        Store.Save<IStatBlock>('PlayerCharacters', newStatBlock.Id, newStatBlock)
                    }
                });
            });
        }
        
        AddNewPlayerCharacter = () => {
            this.statBlockEditor.EditCreature(StatBlock.Empty(s => s.Player = "player"), newStatBlock => {
                var newId = this.library.Players().length.toString();
                newStatBlock.Id = newId;
                var newListing = new CreatureListing(newId, newStatBlock.Name, newStatBlock.Type, null, newStatBlock);
                this.library.Players.unshift(newListing);
                Store.Save<IStatBlock>('PlayerCharacters', newId, newStatBlock);
            });
        }
        
        SelectCreature = (data: ICreature, e?: MouseEvent) => {
            if(!data){
                return;
            }
            if(!(e && e.ctrlKey)){
                this.SelectedCreatures.removeAll();
            }
            this.SelectedCreatures.push(data);
        }
        
        private selectCreatureByOffset = (offset: number) => 
        {
            var newIndex = this.encounter().Creatures.indexOf(this.SelectedCreatures()[0]) + offset;
            if(newIndex < 0){ 
                newIndex = 0;
            } else if(newIndex >= this.encounter().Creatures().length) { 
                newIndex = this.encounter().Creatures().length - 1; 
            }
            this.SelectedCreatures.removeAll()
            this.SelectedCreatures.push(this.encounter().Creatures()[newIndex]);
        }
        
        RemoveSelectedCreatures = () => {
            var creatures = this.SelectedCreatures.removeAll(),
                index = this.encounter().Creatures.indexOf(creatures[0]),
                deletedCreatureNames = creatures.map(c => c.StatBlock().Name);
            
            this.encounter().Creatures.removeAll(creatures);
            
            var allMyFriendsAreGone = name => this.encounter().Creatures().every(c => c.StatBlock().Name != name);
            
            deletedCreatureNames.forEach(name => {
                if(allMyFriendsAreGone(name)){
                    this.encounter().CreatureCountsByName[name](0);
                }
            });
            
            if(index >= this.encounter().Creatures().length){
                index = this.encounter().Creatures().length - 1;
            }
            this.SelectCreature(this.encounter().Creatures()[index])
            
            this.encounter().QueueEmitEncounter();
        }
            
        SelectPreviousCombatant = () =>
        {
            this.selectCreatureByOffset(-1);
        }
            
        SelectNextCombatant = () =>
        {
            this.selectCreatureByOffset(1);
        }
            
        FocusSelectedCreatureHP = () =>
        {
            var selectedCreatures = this.SelectedCreatures();
            var creatureNames = selectedCreatures.map(c => c.ViewModel.DisplayName()).join(', ')
            this.userPollQueue.Add({
                requestContent: `Apply damage to ${creatureNames}: <input class='response' type='number' />`,
                inputSelector: '.response',
                callback: response => selectedCreatures.forEach(c => {
                c.ViewModel.ApplyDamage(response);
                this.encounter().QueueEmitEncounter();
                })
            });
            return false;
        }
            
        AddSelectedCreaturesTemporaryHP = () => 
        {
            var selectedCreatures = this.SelectedCreatures();
            var creatureNames = selectedCreatures.map(c => c.ViewModel.DisplayName()).join(', ')
            this.userPollQueue.Add({
                requestContent: `Grant temporary hit points to ${creatureNames}: <input class='response' type='number' />`,
                inputSelector: '.response',
                callback: response => selectedCreatures.forEach(c => {
                c.ViewModel.ApplyTemporaryHP(response);
                this.encounter().QueueEmitEncounter();
                })
            });
            return false;
        }
            
        AddSelectedCreatureTag = () => 
        {
            this.SelectedCreatures().forEach(c => c.ViewModel.AddingTag(true))
            return false;
        }
            
        EditSelectedCreatureInitiative = () => {
            this.SelectedCreatures().forEach(c => c.ViewModel.EditInitiative())
            return false;
        }
            
        MoveSelectedCreatureUp = () =>
        {
            var creature = this.SelectedCreatures()[0];
            var index = this.encounter().Creatures.indexOf(creature)
            if(creature && index > 0){
                this.encounter().MoveCreature(creature, index - 1);
            }
        }
            
        MoveSelectedCreatureDown = () =>
        {
            var creature = this.SelectedCreatures()[0];
            var index = this.encounter().Creatures.indexOf(creature)
            if(creature && index < this.encounter().Creatures().length - 1){
                this.encounter().MoveCreature(creature, index + 1);
            }
        }
            
        EditSelectedCreatureName = () => 
        {
            this.SelectedCreatures().forEach(c => c.ViewModel.EditName() )
            return false;
        }
            
        EditSelectedCreatureStatBlock = () => 
        {
            if(this.SelectedCreatures().length == 1){
                var selectedCreature = this.SelectedCreatures()[0];
                this.statBlockEditor.EditCreature(this.SelectedCreatureStatblock(), newStatBlock => {
                    selectedCreature.StatBlock(newStatBlock);
                    this.encounter().QueueEmitEncounter();
                })
            }
        }
        
        FocusResponseRequest = () => {
            $('#user-response-requests input').first().select();
        }
        
        ShowLibraries = () => {
            $('.libraries').slideDown();
        }
        
        LaunchPlayerWindow = () => {
            window.open(`/p/${this.encounter().EncounterId}`, 'Player View');
        }
        
        ToggleCommandDisplay = () => {
            $('.modalblur').toggle();
            if ($('.commands').toggle().css('display') == 'none'){
                this.RegisterKeyBindings();
            }
        }
        
        DropModalBlur = () => {
            $('.modalblur, .modal').hide();
        }
        
        RegisterKeyBindings(){
            Mousetrap.reset();
            this.Commands.forEach(b => {
                Mousetrap.bind(b.KeyBinding, b.ActionBinding);
                Store.Save('KeyBindings', b.Description, b.KeyBinding);
                Store.Save('ActionBar', b.Description, b.ShowOnActionBar);
            })
        }
        
        RollInitiative = () => {
            this.encounter().RollInitiative(this.userPollQueue);
            this.userPollQueue.Add({
                callback: this.encounter().StartEncounter
            });
        }
        
        NextTurn = () => {
            this.encounter().NextTurn();
        }
        
        PreviousTurn = () => {
            this.encounter().PreviousTurn();
        }
        SaveEncounter = () => {
            this.userPollQueue.Add({
                requestContent: `<p>Save Encounter As: <input class='response' type='text' value='' /></p>`,
                inputSelector: '.response',
                callback: (response: string) => {
                    var savedEncounter = this.encounter().Save(response);
                    var savedEncounters = this.library.SavedEncounterIndex;
                    if(savedEncounters.indexOf(response) == -1){
                        savedEncounters().push(response);
                    }
                    Store.Save('SavedEncounters', response, savedEncounter);
                }
            })
        }
    
        LoadEncounterByName = (encounterName: string) => {
            var encounter = Store.Load<ISavedEncounter<ISavedCreature>>('SavedEncounters', encounterName);
            this.encounter().LoadSavedEncounter(encounter)
        }
    }
}