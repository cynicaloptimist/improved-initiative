module ImprovedInitiative {
    export type EntitySource = "server" | "account" | "localStorage";
    export class StatBlockListingStatic {
        Name: string;
        Id: string;
        Keywords: string;
        Link: string;
        Source: EntitySource;
    }
    
    export class StatBlockListing {

        Name: KnockoutObservable<string>;

        private loadPromise: JQueryXHR;
        private statBlock: KnockoutObservable<StatBlock>;

        constructor(public Id: string, name: string, public Keywords: string, public Link: string, public Source: EntitySource, statBlock?: StatBlock) {
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
                if (statBlock.Player === "player") {
                    new AccountClient().SavePlayerCharacter(statBlock);
                } else {
                    new AccountClient().SaveStatBlock(statBlock);    
                }
            }
        }
    }
}