module ImprovedInitiative {
    export class RemovableArrayValue<T> {
        public Remove = () => {
            this.containingArray.remove(this);
        }
            
        constructor(private containingArray: KnockoutObservableArray<RemovableArrayValue<T>>, public Value?: T) {}
    }
}