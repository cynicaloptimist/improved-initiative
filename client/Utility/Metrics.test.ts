import axios from "axios";
import { env } from "../Environment";
import { LegacySynchronousLocalStore } from "./LegacySynchronousLocalStore";
import { Metrics } from "./Metrics";

const axiosMock = axios as jest.Mocked<typeof axios>;

describe("Metrics analytics consent", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    env.IsLoggedIn = true;
    env.GoogleAnalyticsId = "G-TEST";
    (globalThis as any).gtag = jest.fn(
      (command: string, _measurementId: string, _field: string, callback) => {
        if (command == "get") {
          callback("123456.789012");
        }
      }
    );
  });

  afterEach(() => {
    env.IsLoggedIn = false;
    env.GoogleAnalyticsId = "";
    delete (globalThis as any).gtag;
  });

  test("records client id for an opted-in user", () => {
    LegacySynchronousLocalStore.Save(
      LegacySynchronousLocalStore.User,
      "AllowTracking",
      true
    );

    Metrics.SyncGoogleAnalyticsConsent();

    expect(axiosMock.post).toHaveBeenCalledWith(
      "/recordGoogleAnalyticsClientId",
      expect.stringContaining("123456.789012"),
      expect.anything()
    );
    expect(axiosMock.delete).not.toHaveBeenCalled();
  });

  test("clears client id for an opted-out user", () => {
    LegacySynchronousLocalStore.Save(
      LegacySynchronousLocalStore.User,
      "AllowTracking",
      false
    );

    Metrics.SyncGoogleAnalyticsConsent();

    expect(axiosMock.delete).toHaveBeenCalledWith(
      "/recordGoogleAnalyticsClientId"
    );
    expect(axiosMock.post).not.toHaveBeenCalled();
  });

  test("does not synchronize consent for a logged-out user", () => {
    env.IsLoggedIn = false;
    LegacySynchronousLocalStore.Save(
      LegacySynchronousLocalStore.User,
      "AllowTracking",
      true
    );

    Metrics.SyncGoogleAnalyticsConsent();

    expect(axiosMock.post).not.toHaveBeenCalled();
    expect(axiosMock.delete).not.toHaveBeenCalled();
  });
});
