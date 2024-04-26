import http from "http";
import { SocketService } from "./services/socket";

async function init() {
  const httpServer = http.createServer();
  const PORT = process.env.PORT ? process.env.PORT : 5000;

  SocketService().attach(httpServer);
  httpServer.listen(PORT, () =>
    console.log(`HTTP server started at PORT:${PORT}`)
  );
}
init();
