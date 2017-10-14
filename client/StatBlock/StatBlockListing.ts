module ImprovedInitiative {
    export class StatBlockListing {

        Name: KnockoutObservable<string>;

        private loadPromise: JQueryXHR;
        private statBlock: KnockoutObservable<StatBlock>;

        constructor(public Id: string, name: string, public Keywords: string, public Link: string, public Source: "server" | "account" | "localStorage", statBlock?: StatBlock) {
            this.Name = ko.observable(name);
            this.statBlock = ko.observable(statBlock);

            this.statBlock.subscribe(newStatBlock => {
                this.Name(newStatBlock.Name);
                this.Keywords = newStatBlock.Type;
            });
        }

        GetStatBlockAsync = (callback: (statBlock: StatBlock) => void) => {
            if (this.statBlock() !== undefined) {
                callback(this.statBlock());
                return;
            }
            if (this.loadPromise) {
                this.loadPromise.then(() => {
                    callback(this.statBlock());
                });
                return;
            }

            this.loadPromise = $.getJSON(this.Link, (json) => {
                const statBlock = { ...StatBlock.Default(), ...json };
                this.statBlock(statBlock);
                callback(statBlock);
            });
        }

        SetStatBlock = (statBlock: StatBlock) => {
            this.statBlock(statBlock);
            if (this.Source === "account" || this.Source === "localStorage") {
                new AccountClient().SaveCreature(statBlock);
            }
        }
    }
}