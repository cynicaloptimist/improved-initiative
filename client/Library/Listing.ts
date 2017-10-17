module ImprovedInitiative {
    export type ListingSource = "server" | "account" | "localStorage";
    
    export interface Listing<T extends { Name?: string }> {
        Value: KnockoutObservable<T>;
        Id: string;
        Link: string;
        Name: string;
        Source: ListingSource;
        SearchHint: string;
    }

    export class Listing<T extends { Name?: string }> {
        constructor(
            public Id: string,
            public Name: string,
            public SearchHint: string,
            public Link: string,
            public Source: ListingSource,
            value?: T
        ) { 
            if (value) {
                this.Value(value);
            }
         }

        Value = ko.observable<T>();
        
        GetAsync(callback: (item: T) => void) {
            $.getJSON(this.Link).done(item => {
                this.Value(item);
                callback(this.Value());
            });
        }

        CurrentName = ko.computed(() => {
            if (this.Value() !== undefined) {
                this.CurrentName()
            }
        })
    }
}