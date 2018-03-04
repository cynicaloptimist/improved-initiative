import { StatBlock } from "../StatBlock/StatBlock";
import { RemovableArrayValue } from "../Utility/RemovableArrayValue";
import { Store } from "../Utility/Store";

export class StatBlockEditor {
    private saveCallback: (library: string, id: string, newStatBlock: StatBlock) => void;
    private deleteCallback: (library: string, id: string) => void;
    private statBlock: StatBlock;
    private statBlockId: string;

    public EditMode = ko.observable<"instance" | "global">();
    public EditorType = ko.observable<"basic" | "advanced">("basic");
    public JsonStatBlock = ko.observable<string>();
    public EditableStatBlock = ko.observable(null);

    public HasStatBlock = ko.pureComputed(() => this.EditableStatBlock() !== null);

    public EditStatBlock = (statBlockId: string,
        statBlock: StatBlock,
        saveCallback: (library: string, id: string, newStatBlock: StatBlock) => void,
        deleteCallback: (library: string, id: string) => void,
        editMode: "instance" | "global"
    ) => {

        this.statBlockId = statBlockId;
        this.statBlock = { ...StatBlock.Default(), ...statBlock };
        delete this.statBlock.Id;

        this.EditableStatBlock(this.makeEditable(this.statBlock));
        this.JsonStatBlock(JSON.stringify(this.statBlock, null, 2));

        this.saveCallback = saveCallback;
        this.deleteCallback = deleteCallback;
        this.EditMode(editMode);
    }

    private makeEditable = (statBlock: StatBlock) => {
        let stringLists = ["Speed", "Senses", "DamageVulnerabilities", "DamageResistances", "DamageImmunities", "ConditionImmunities", "Languages"];
        let modifierLists = ["Saves", "Skills"];
        let traitLists = ["Traits", "Actions", "Reactions", "LegendaryActions"];

        let observableStatBlock = ko["mapping"].fromJS(this.statBlock);

        let makeRemovableArrays = (arrayNames: string[], makeEmptyValue: () => any) => {
            for (let arrayName of arrayNames) {
                let array = observableStatBlock[arrayName];
                array(array().map(item => {
                    return new RemovableArrayValue(array, item);
                }));

                array.AddEmpty = (_, event: Event) => {
                    array.push(new RemovableArrayValue(array, makeEmptyValue()));
                    $(event.target)
                        .parent()
                        .find("input.name")
                        .last()
                        .select();
                };
            }
        };

        makeRemovableArrays(stringLists, () => "");

        makeRemovableArrays(modifierLists, () => ({
            Name: ko.observable(""),
            Modifier: ko.observable("")
        }));

        makeRemovableArrays(traitLists, () => ({
            Name: ko.observable(""),
            Content: ko.observable(""),
            Usage: ko.observable("")
        }));

        return observableStatBlock;
    }

    private unMakeEditable = (editableStatBlock: any) => {
        for (const key in editableStatBlock) {
            if (key == "HP") {
                let hpInt = parseInt(editableStatBlock[key].Value());
                if (isNaN(hpInt)) {
                    hpInt = 1;
                }
                editableStatBlock[key].Value(hpInt);
            }

            if (key == "AC") {
                let acInt = parseInt(editableStatBlock[key].Value());
                if (isNaN(acInt)) {
                    acInt = 10;
                }
                editableStatBlock[key].Value(acInt);
            }
            
            if (key == "InitiativeModifier") {
                let initInt = parseInt(editableStatBlock[key]());
                if (isNaN(initInt)) {
                    initInt = 0;
                }
                editableStatBlock[key](initInt);
            }

            const maybeArray = editableStatBlock[key];
            if (ko.isObservable(maybeArray) && maybeArray() !== null && typeof maybeArray().push === "function") {
                editableStatBlock[key] = ko.observableArray(maybeArray().map(e => {
                    return e.Value;
                }));
            }
        }
        const unObservableStatBlock = ko.toJS(editableStatBlock);
        delete unObservableStatBlock.__ko_mapping__;
        return unObservableStatBlock;
    }

    public SelectInput = () => {
        $(".stats input.name").select();
    }

    public SaveStatBlock = () => {
        let editedStatBlock: StatBlock = StatBlock.Default();

        if (this.EditorType() === "advanced") {
            let statBlockFromJSON = {};
            try {
                statBlockFromJSON = JSON.parse(this.JsonStatBlock());
            } catch (error) {
                alert(`Couldn't parse JSON from advanced editor.`);
                return;
            }
            $.extend(editedStatBlock, statBlockFromJSON);
        }
        if (this.EditorType() === "basic") {
            $.extend(editedStatBlock, this.unMakeEditable(this.EditableStatBlock()));
        }

        editedStatBlock.Id = this.statBlockId;

        this.saveCallback(this.statBlockLibrary(), this.statBlockId, editedStatBlock);
        this.EditableStatBlock(null);
    }

    public DeleteStatBlock = () => {
        if (confirm(`Delete your custom statblock for ${this.statBlock.Name}? This cannot be undone.`)) {
            this.deleteCallback(this.statBlockLibrary(), this.statBlockId);
            this.EditableStatBlock(null);
        }
    }

    public RevertStatBlock = () => {
        this.EditableStatBlock(null);
    }

    private statBlockLibrary(): string {
        return this.statBlock.Player == "player" ? Store.PlayerCharacters : Store.StatBlocks;
    }

    private parseInt: (value, defaultValue?: number) => number = (value, defaultValue: number = null) => {
        if (/^(\-|\+)?([0-9]+|Infinity)$/.test(value)) {
            return Number(value);
        }
        if (defaultValue !== null) {
            return defaultValue;
        }
        return NaN;
    }
}

ko.components.register("statblockeditor", {
    viewModel: params => params.editor,
    template: { name: "statblockeditor" }
});
