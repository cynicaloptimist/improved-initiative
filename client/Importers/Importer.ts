export class Importer {
    constructor(protected domElement: Element) { }

    public getString(selector) {
        return $(this.domElement).find(selector).html() || "";
    }

    public getInt(selector) {
        let int = $(this.domElement).find(selector).html();
        if (int) {
            return parseInt(int);
        }
        return 0;
    }

    public getValueAndNotes(selector: string) {
        let valueAndNotes = this.getString(selector).match(/([\d]+) ?(.*)/);
        return {
            Value: parseInt(valueAndNotes[1]),
            Notes: valueAndNotes[2] || ""
        }
    }

    public getCommaSeparatedStrings(selector: string) {
        let commaDelimitedString = this.getString(selector);
        if (commaDelimitedString.length > 0) {
            return commaDelimitedString.split(/, ?/);
        }
        return [];
    }

    public getCommaSeparatedModifiers(selector: string) {
        let entries = this.getCommaSeparatedStrings(selector);
        return entries.map(e => {
            let nameAndModifier = e.split(" ");
            return {
                Name: nameAndModifier[0],
                Modifier: parseInt(nameAndModifier[1])
            }
        })
    }

    public getPowers(selector: string) {
        return $(this.domElement).find(selector).toArray().map(p => ({
            Name: $(p).find("name").html(),
            Content: $(p).find("text").map((i, e) => e.innerHTML).get().join("\n"),
            Usage: ""
        }))
    }
}