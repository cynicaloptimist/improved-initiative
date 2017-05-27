import * as moment from "moment";

export class TurnTimer {
    private elapsedSeconds = ko.observable(0);
    private incrementElapsedSeconds = () => this.elapsedSeconds(this.elapsedSeconds() + 1);
    private intervalToken = null;

    Start = () => {
        if (this.intervalToken) {
            this.Stop();
        }
        this.intervalToken = setInterval(this.incrementElapsedSeconds, 1000);
    }

    Stop = () => {
        clearInterval(this.intervalToken);
        this.elapsedSeconds(0);
    }

    Reset = () => {
        this.Stop();
        this.Start();
    }

    Readout = ko.pureComputed(() => {
        let time = moment.duration({ seconds: this.elapsedSeconds() });
        let paddedSeconds = time.seconds().toString();
        if (paddedSeconds.length < 2) {
            paddedSeconds = '0' + paddedSeconds;
        }

        return time.minutes() + ':' + paddedSeconds;
    });
}
