import { CombatantViewModel } from "../Combatant/CombatantViewModel";
import { DefaultPrompt } from "./Prompts/Prompt";
import { TrackerViewModel } from "../TrackerViewModel";
import { BuildCombatantCommandList, Command } from "./Command";
import { Store } from "../Utility/Store";
import { StatBlock } from "../StatBlock/StatBlock";
import { CurrentSettings } from "../Settings/Settings";
import { AcceptDamagePrompt } from "./Prompts/AcceptDamagePrompt";
import { Combatant } from "../Combatant/Combatant";
import { ConcentrationPrompt } from "./Prompts/ConcentrationPrompt";
import { probablyUniqueString } from "../Utility/Toolbox";

interface PendingLinkInitiative {
    combatant: CombatantViewModel;
    prompt: DefaultPrompt;
}

export class CombatantCommander {
    constructor(private tracker: TrackerViewModel) {
        this.Commands = BuildCombatantCommandList(this);

        this.Commands.forEach(c => {
            var keyBinding = Store.Load<string>(Store.KeyBindings, c.Description);
            if (keyBinding) {
                c.KeyBinding = keyBinding;
            }
            var showOnActionBar = Store.Load<boolean>(Store.ActionBar, c.Description);
            if (showOnActionBar != null) {
                c.ShowOnActionBar(showOnActionBar);
            }
        });
    }

    Commands: Command[];
    SelectedCombatants: KnockoutObservableArray<CombatantViewModel> = ko.observableArray<CombatantViewModel>([]);

    HasSelected = ko.pureComputed(() => this.SelectedCombatants().length > 0);
    HasOneSelected = ko.pureComputed(() => this.SelectedCombatants().length === 1);
    HasMultipleSelected = ko.pureComputed(() => this.SelectedCombatants().length > 1);

    StatBlock: KnockoutComputed<StatBlock> = ko.pureComputed(() => {
        var selectedCombatants = this.SelectedCombatants();
        if (selectedCombatants.length == 1) {
            return selectedCombatants[0].Combatant.StatBlock();
        } else {
            return StatBlock.Default();
        }
    });

    Names: KnockoutComputed<string> = ko.pureComputed(() =>
        this.SelectedCombatants()
            .map(c => c.Name())
            .join(', ')
    );

    Select = (data: CombatantViewModel, e?: MouseEvent) => {
        if (!data) {
            return;
        }
        const pendingLink = this.pendingLinkInitiative();
        if (pendingLink) {
            this.linkCombatantInitiatives([data, pendingLink.combatant]);
            pendingLink.prompt.Resolve(null);
        }
        if (!(e && e.ctrlKey || e && e.metaKey)) {
            this.SelectedCombatants.removeAll();
        }
        this.SelectedCombatants.push(data);
    }

    private selectByOffset = (offset: number) => {
        var newIndex = this.tracker.CombatantViewModels().indexOf(this.SelectedCombatants()[0]) + offset;
        if (newIndex < 0) {
            newIndex = 0;
        } else if (newIndex >= this.tracker.CombatantViewModels().length) {
            newIndex = this.tracker.CombatantViewModels().length - 1;
        }
        this.SelectedCombatants.removeAll()
        this.SelectedCombatants.push(this.tracker.CombatantViewModels()[newIndex]);
    }

    Remove = () => {
        const combatantsToRemove = this.SelectedCombatants.removeAll(),
            firstDeletedIndex = this.tracker.CombatantViewModels().indexOf(combatantsToRemove[0]),
            deletedCombatantNames = combatantsToRemove.map(c => c.Combatant.StatBlock().Name);

        if (this.tracker.CombatantViewModels().length > combatantsToRemove.length) {
            let activeCombatant = this.tracker.Encounter.ActiveCombatant();
            while (combatantsToRemove.some(c => c.Combatant === activeCombatant)) {
                this.tracker.Encounter.NextTurn();
                activeCombatant = this.tracker.Encounter.ActiveCombatant();
            }
        }

        this.tracker.CombatantViewModels.removeAll(combatantsToRemove);
        this.tracker.Encounter.Combatants.removeAll(combatantsToRemove.map(c => c.Combatant));

        const remainingCombatants = this.tracker.CombatantViewModels();

        var allMyFriendsAreGone = name => remainingCombatants.every(c => c.Combatant.StatBlock().Name != name);

        deletedCombatantNames.forEach(name => {
            if (allMyFriendsAreGone(name)) {
                const combatantCountsByName = this.tracker.Encounter.CombatantCountsByName();
                delete combatantCountsByName[name];
                this.tracker.Encounter.CombatantCountsByName(combatantCountsByName);
            }
        });

        if (remainingCombatants.length > 0) {
            const newSelectionIndex =
                firstDeletedIndex > remainingCombatants.length ?
                    remainingCombatants.length - 1 :
                    firstDeletedIndex;
            this.Select(this.tracker.CombatantViewModels()[newSelectionIndex])
        } else {
            this.tracker.Encounter.EndEncounter();
        }

        this.tracker.EventLog.AddEvent(`${deletedCombatantNames.join(', ')} removed from encounter.`);

        this.tracker.Encounter.QueueEmitEncounter();
    }

    Deselect = () => {
        this.SelectedCombatants([]);
    }

    SelectPrevious = () => {
        this.selectByOffset(-1);
    }

    SelectNext = () => {
        this.selectByOffset(1);
    }

    private CreateEditHPCallback = (combatants: CombatantViewModel[], combatantNames: string) => {
        return (response) => {
            const damage = response['damage'];
            if (damage) {
                combatants.forEach(c => c.ApplyDamage(damage));
                const damageNum = parseInt(damage);
                this.tracker.EventLog.LogHPChange(damageNum, combatantNames);
                this.tracker.Encounter.QueueEmitEncounter();
            }
        }
    }

    EditHP = () => {
        const selectedCombatants = this.SelectedCombatants();
        const combatantNames = selectedCombatants.map(c => c.Name()).join(', ');
        const callback = this.CreateEditHPCallback(selectedCombatants, combatantNames);
        const prompt = new DefaultPrompt(`Apply damage to ${combatantNames}: <input id='damage' class='response' type='number' />`, callback);
        this.tracker.PromptQueue.Add(prompt);
        return false;
    }

    SuggestEditHP = (suggestedCombatants: CombatantViewModel[], suggestedDamage: number, suggester: string) => {
        const allowPlayerSuggestions = CurrentSettings().PlayerView.AllowPlayerSuggestions;

        if (!allowPlayerSuggestions) {
            return false;
        }

        const prompt = new AcceptDamagePrompt(suggestedCombatants, suggestedDamage, suggester, this.tracker);

        this.tracker.PromptQueue.Add(prompt);
        return false;
    }

    CheckConcentration = (combatant: Combatant, damageAmount: number) => {
        setTimeout(() => {
            const prompt = new ConcentrationPrompt(combatant, damageAmount);
            this.tracker.PromptQueue.Add(prompt);
        }, 1);
    }

    AddTemporaryHP = () => {
        const selectedCombatants = this.SelectedCombatants();
        const combatantNames = selectedCombatants.map(c => c.Name()).join(', ');
        const prompt = new DefaultPrompt(`Grant temporary hit points to ${combatantNames}: <input id='thp' class='response' type='number' />`,
            response => {
                const thp = response['thp'];
                if (thp) {
                    selectedCombatants.forEach(c => c.ApplyTemporaryHP(thp));
                    this.tracker.EventLog.AddEvent(`${thp} temporary hit points granted to ${combatantNames}.`);
                    this.tracker.Encounter.QueueEmitEncounter();
                }
            });
        this.tracker.PromptQueue.Add(prompt);

        return false;
    }

    AddTag = (combatantVM?: CombatantViewModel) => {
        if (combatantVM instanceof CombatantViewModel) {
            this.Select(combatantVM);
        }
        this.SelectedCombatants().forEach(c => c.AddTag(this.tracker.Encounter))
        return false;
    }

    EditInitiative = () => {
        this.SelectedCombatants().forEach(c => c.EditInitiative())
        return false;
    }

    private pendingLinkInitiative = ko.observable<PendingLinkInitiative>(null);

    private linkCombatantInitiatives = (combatants: CombatantViewModel[]) => {
        this.pendingLinkInitiative(null);
        const highestInitiative = combatants.map(c => c.Combatant.Initiative()).sort((a, b) => b - a)[0];
        const initiativeGroup = probablyUniqueString();

        combatants.forEach(s => {
            s.Combatant.Initiative(highestInitiative);
            s.Combatant.InitiativeGroup(initiativeGroup);
        });
        this.tracker.Encounter.CleanInitiativeGroups();

        this.tracker.Encounter.SortByInitiative();
    }

    LinkInitiative = () => {
        const selected = this.SelectedCombatants();

        if (selected.length <= 1) {
            const message = `<p>Select another combatant to link initiative. <br /><em>Tip:</em> You can select multiple combatants with 'ctrl', then use this command to link them to one shared initiative count.</p>`;
            const prompt = new DefaultPrompt(message, _ => this.pendingLinkInitiative(null));
            this.tracker.PromptQueue.Add(prompt);
            this.pendingLinkInitiative({ combatant: selected[0], prompt: prompt });
            return;
        }

        this.linkCombatantInitiatives(selected);
    }

    MoveUp = () => {
        const combatant = this.SelectedCombatants()[0];
        const index = this.tracker.CombatantViewModels().indexOf(combatant)
        if (combatant && index > 0) {
            const newInitiative = this.tracker.Encounter.MoveCombatant(combatant.Combatant, index - 1);
            this.tracker.EventLog.AddEvent(`${combatant.Name()} initiative set to ${newInitiative}.`);
        }
    }

    MoveDown = () => {
        const combatant = this.SelectedCombatants()[0];
        const index = this.tracker.CombatantViewModels().indexOf(combatant)
        if (combatant && index < this.tracker.CombatantViewModels().length - 1) {
            const newInitiative = this.tracker.Encounter.MoveCombatant(combatant.Combatant, index + 1);
            this.tracker.EventLog.AddEvent(`${combatant.Name()} initiative set to ${newInitiative}.`);
        }
    }

    EditName = () => {
        this.SelectedCombatants().forEach(c => c.EditName())
        return false;
    }

    EditStatBlock = () => {
        if (this.SelectedCombatants().length == 1) {
            var selectedCombatant = this.SelectedCombatants()[0];
            this.tracker.StatBlockEditor.EditStatBlock(null, this.StatBlock(), (_, __, newStatBlock) => {
                selectedCombatant.Combatant.StatBlock(newStatBlock);
                this.tracker.Encounter.QueueEmitEncounter();
            }, (_, __) => {
                this.Remove();
            },
                "instance");
        }
    }
}
