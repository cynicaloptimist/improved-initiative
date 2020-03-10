import * as moment from "moment";

export function GetTimerReadout(elapsedSeconds: number) {
  if (isNaN(elapsedSeconds)) {
    return "0:00";
  }

  const time = moment.duration({ seconds: elapsedSeconds });
  let paddedSeconds = time.seconds().toString(),
    paddedMinutes = time.minutes().toString();

  const hours = time.hours();

  if (paddedSeconds.length < 2) {
    paddedSeconds = "0" + paddedSeconds;
  }

  if (hours < 1) {
    return paddedMinutes + ":" + paddedSeconds;
  }

  if (paddedMinutes.length < 2) {
    paddedMinutes = "0" + paddedMinutes;
  }

  return hours.toString() + ":" + paddedMinutes + ":" + paddedSeconds;
}
