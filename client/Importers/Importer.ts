export class Importer {
    constructor(protected domElement: Element) { }

    public getString(selector) {
        return $(this.domElement).find(selector).html() || "";
    }

    public getInt(selector) {
        var int = $(this.domElement).find(selector).html();
        if (int) {
            return parseInt(int);
        }
        return 0;
    }

    public getValueAndNotes(selector: string) {
        var valueAndNotes = this.getString(selector).match(/([\d]+) ?(.*)/);
        return {
            Value: parseInt(valueAndNotes[1]),
            Notes: valueAndNotes[2] || ""
        }
    }

    public getCommaSeparatedStrings(selector: string) {
        var commaDelimitedString = this.getString(selector);
        if (commaDelimitedString.length > 0) {
            return commaDelimitedString.split(/, ?/);
        }
        return [];
    }

    public getCommaSeparatedModifiers(selector: string) {
        var entries = this.getCommaSeparatedStrings(selector);
        return entries.map(e => {
            var nameAndModifier = e.split(" ");
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