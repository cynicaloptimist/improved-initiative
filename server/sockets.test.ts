import * as express from "express";
import expressSession = require("express-session");
import * as http from "http";
import { AddressInfo } from "net";
import { Server as SocketServer } from "socket.io";
import { io as connectSocket, Socket as ClientSocket } from "socket.io-client";

import { PlayerViewManager } from "./playerviewmanager";
import ConfigureSockets from "./sockets";

describe("Socket.IO sessions", () => {
  let app: express.Application;
  let httpServer: http.Server;
  let io: SocketServer;
  let baseUrl: string;
  let sessionStore: expressSession.MemoryStore;
  let playerViews: jest.Mocked<PlayerViewManager>;
  let clients: ClientSocket[];
  const previousRedisUrl = process.env.REDIS_URL;

  beforeAll(async () => {
    delete process.env.REDIS_URL;
    app = express();
    httpServer = http.createServer(app);
    sessionStore = new expressSession.MemoryStore();
    const sessionMiddleware = expressSession({
      secret: "socket-session-test-secret",
      resave: false,
      saveUninitialized: false,
      store: sessionStore
    });
    app.use(sessionMiddleware);
    app.get("/session/:access", (req, res) => {
      const session = req.session!;
      session.hasEpicInitiative = req.params.access === "epic";
      session.encounterId = "originalEncounter";
      res.sendStatus(204);
    });

    playerViews = {
      Destroy: jest.fn(),
      Get: jest.fn(),
      IdAvailable: jest.fn().mockResolvedValue(true),
      InitializeNew: jest.fn(),
      UpdateEncounter: jest.fn(),
      UpdateSettings: jest.fn()
    };
    io = new SocketServer(httpServer);
    await ConfigureSockets(io, sessionMiddleware, playerViews);
    await new Promise<void>(resolve => httpServer.listen(0, resolve));
    const address = httpServer.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  beforeEach(async () => {
    clients = [];
    jest.clearAllMocks();
    playerViews.IdAvailable.mockResolvedValue(true);
    await new Promise<void>((resolve, reject) =>
      sessionStore.clear(error => (error ? reject(error) : resolve()))
    );
  });

  afterEach(() => {
    clients.forEach(client => client.disconnect());
  });

  afterAll(async () => {
    await new Promise<void>(resolve => io.close(() => resolve()));
    if (previousRedisUrl === undefined) {
      delete process.env.REDIS_URL;
    } else {
      process.env.REDIS_URL = previousRedisUrl;
    }
  });

  test("shares an authenticated HTTP session with a socket", async () => {
    const cookie = await createHttpSession("epic");
    const socket = await connectClient(cookie);

    await expect(requestCustomId(socket, "customEncounter")).resolves.toBe(
      true
    );
    expect(playerViews.IdAvailable).toHaveBeenCalledWith("customEncounter");
    expect(playerViews.Destroy).toHaveBeenCalledWith("originalEncounter");
  });

  test("keeps anonymous sockets unauthenticated", async () => {
    const socket = await connectClient();

    await expect(requestCustomId(socket, "customEncounter")).resolves.toBe(
      false
    );
    expect(playerViews.IdAvailable).not.toHaveBeenCalled();
  });

  test("preserves HTTP session access after reconnecting", async () => {
    const cookie = await createHttpSession("epic");
    const firstSocket = await connectClient(cookie);
    firstSocket.disconnect();

    const reconnectedSocket = await connectClient(cookie);
    await expect(
      requestCustomId(reconnectedSocket, "reconnectedEncounter")
    ).resolves.toBe(true);
  });

  test("does not grant access after the session is removed", async () => {
    const cookie = await createHttpSession("epic");
    await destroyStoredSessions();
    const socket = await connectClient(cookie);

    await expect(requestCustomId(socket, "customEncounter")).resolves.toBe(
      false
    );
  });

  function createHttpSession(access: "epic"): Promise<string> {
    return new Promise((resolve, reject) => {
      http
        .get(`${baseUrl}/session/${access}`, response => {
          const cookie = response.headers["set-cookie"]?.[0].split(";")[0];
          response.resume();
          response.on("end", () => {
            if (cookie) {
              resolve(cookie);
            } else {
              reject(new Error("Session response did not set a cookie."));
            }
          });
        })
        .on("error", reject);
    });
  }

  function connectClient(cookie?: string): Promise<ClientSocket> {
    return new Promise((resolve, reject) => {
      const client = connectSocket(baseUrl, {
        extraHeaders: cookie ? { Cookie: cookie } : undefined,
        forceNew: true,
        transports: ["websocket"]
      });
      clients.push(client);
      client.once("connect", () => resolve(client));
      client.once("connect_error", reject);
    });
  }

  function requestCustomId(socket: ClientSocket, id: string): Promise<boolean> {
    return new Promise(resolve =>
      socket.emit("request custom id", id, resolve)
    );
  }

  async function destroyStoredSessions(): Promise<void> {
    const sessions = await new Promise<Record<string, Express.SessionData>>(
      (resolve, reject) =>
        sessionStore.all((error, storedSessions) => {
          if (error) {
            reject(error);
          } else {
            resolve(
              (storedSessions || {}) as Record<string, Express.SessionData>
            );
          }
        })
    );
    await Promise.all(
      Object.keys(sessions).map(
        id =>
          new Promise<void>((resolve, reject) =>
            sessionStore.destroy(id, error =>
              error ? reject(error) : resolve()
            )
          )
      )
    );
  }
});
