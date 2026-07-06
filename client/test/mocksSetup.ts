import axios from "axios";

const globalScope = globalThis as typeof globalThis & {
  setImmediate?: (callback: (...args: any[]) => void, ...args: any[]) => any;
};

if (typeof globalScope.setImmediate === "undefined") {
  globalScope.setImmediate = ((
    callback: (...args: any[]) => void,
    ...args: any[]
  ) => setTimeout(callback, 0, ...args)) as any;
}

jest.mock("axios");
jest.mock("socket.io-client", () => ({
  io: jest.fn(() => ({
    connected: false,
    disconnect: jest.fn(),
    emit: jest.fn(),
    on: jest.fn()
  }))
}));

const axiosMock = axios as jest.Mocked<typeof axios>;

axiosMock.get.mockResolvedValue({ data: {} });
