import http = require("http");
import { AddressInfo } from "net";

export default function (server: http.Server) {
  const defaultPort = process.env.PORT || 80;
  server.listen(defaultPort, () => {
    const address = server.address() as AddressInfo;
    console.log("Improved Initiative listening at http://%s:%s", address.address, address.port);
  });
}
