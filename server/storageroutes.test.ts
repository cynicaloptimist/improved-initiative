import axios from "axios";
import * as express from "express";
import * as http from "http";
import { ObjectId } from "mongodb";

import * as DB from "./dbconnection";
import configureStorageRoutes from "./storageroutes";

jest.mock("./dbconnection");

const getEntityMock = DB.getEntity as jest.Mock;
const deleteEntityMock = DB.deleteEntity as jest.Mock;

describe("storage entity routes", () => {
  let server: http.Server;
  let baseUrl: string;
  const userId = new ObjectId();

  beforeAll(done => {
    const app = express();
    app.use((req, _res, next) => {
      req.session = {
        userId,
        hasStorage: true
      } as unknown as express.Request["session"];
      next();
    });
    configureStorageRoutes(app);

    server = app.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        done(new Error("Storage route test server did not bind to a port."));
        return;
      }

      baseUrl = `http://127.0.0.1:${address.port}`;
      done();
    });
  });

  afterAll(done => {
    server.close(done);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test("preserves slash-containing IDs when loading an entity", async () => {
    const entity = { Id: "malformed/id", Name: "Legacy Entity" };
    getEntityMock.mockResolvedValue(entity);

    const response = await axios.get(`${baseUrl}/my/statblocks/malformed/id`);

    expect(response.data).toEqual(entity);
    expect(getEntityMock).toHaveBeenCalledWith(
      "statblocks",
      userId,
      "malformed/id"
    );
  });

  test("preserves slash-containing IDs when deleting an entity", async () => {
    deleteEntityMock.mockImplementation((_route, _userId, _id, callback) => {
      callback(true);
      return Promise.resolve();
    });

    const response = await axios.delete(
      `${baseUrl}/my/statblocks/malformed/id`
    );

    expect(response.status).toBe(204);
    expect(deleteEntityMock).toHaveBeenCalledWith(
      "statblocks",
      userId,
      "malformed/id",
      expect.any(Function)
    );
  });
});
