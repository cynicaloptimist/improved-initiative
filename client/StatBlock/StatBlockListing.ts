module ImprovedInitiative {
    export class StatBlockListing {
        
        Name: KnockoutObservable<string>;
        
        private isLoaded: boolean;
        private loadPromise: JQueryXHR;
        private statBlock: KnockoutObservable<StatBlock>;

        constructor(public Id: string, name: string, public Keywords: string, public Link: string, public Source: string, statBlock?: StatBlock) {
            this.Name = ko.observable(name);
            this.isLoaded = !!statBlock;
            this.statBlock = ko.observable(statBlock || StatBlock.Default());
            this.statBlock.subscribe(newStatBlock => {
                this.Name(newStatBlock.Name);
                this.Keywords = newStatBlock.Type;
            });
        }

        GetStatBlockAsync = (callback: (statBlock: StatBlock) => void) => {
            if (this.isLoaded) {
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
                this.isLoaded = true;
                this.statBlock({ ...StatBlock.Default(), ...json });
                callback(this.statBlock());
            });
        }

        SetStatBlock = (statBlock: StatBlock) => {
            this.isLoaded = true;
            this.statBlock(statBlock);
        }
    }
}