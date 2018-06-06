import * as ko from "knockout";
import * as moment from "moment";

export class TurnTimer {
    private elapsedSeconds = ko.observable(0);
    private incrementElapsedSeconds = () => this.elapsedSeconds(this.elapsedSeconds() + 1);
    private intervalToken = null;

    public Start = () => {
        if (this.intervalToken) {
            this.Stop();
        }
        this.intervalToken = setInterval(this.incrementElapsedSeconds, 1000);
    }

    public Stop = () => {
        clearInterval(this.intervalToken);
        this.elapsedSeconds(0);
    }

    public Reset = () => {
        this.Stop();
        this.Start();
    }

    public Readout = ko.pureComputed(() => {
        let time = moment.duration({ seconds: this.elapsedSeconds() });
        let paddedSeconds = time.seconds().toString();
        if (paddedSeconds.length < 2) {
            paddedSeconds = "0" + paddedSeconds;
        }

        return time.minutes() + ":" + paddedSeconds;
    });
}
